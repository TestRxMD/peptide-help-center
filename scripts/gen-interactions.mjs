// Regenerates api/_interactions.ts from the interaction-checker page so the AI's
// interaction tool can never drift from the on-site checker. Runs automatically
// via the `prebuild` npm hook (and therefore on every Vercel deploy), or manually
// with `npm run gen:interactions`.
//
// It lifts the data + lookup logic (types, category groups, SUBSTANCES,
// INTERACTIONS, CATEGORY_INTERACTIONS, getSubstance, findInteraction) out of the
// React page — everything from `type SubType` up to the first React component —
// drops the UI-only SEV styling map, and appends a small tool wrapper.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'src/pages/InteractionCheckerPage.tsx');
const OUT = resolve(root, 'api/_interactions.ts');

const page = readFileSync(SRC, 'utf8');

// Region = from the first type declaration to just before the first React component.
const startMarker = '\ntype SubType';
const endMarker = '\nfunction SeverityBadge';
const startIdx = page.indexOf(startMarker);
const endIdx = page.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
  throw new Error(
    `gen-interactions: could not locate data region (start=${startIdx}, end=${endIdx}). ` +
    `The checker page structure changed — update the markers in scripts/gen-interactions.mjs.`
  );
}

let region = page.slice(startIdx + 1, endIdx);

// Drop the UI-only severity styling map (`const SEV: Record<Severity, ...> = { ... };`).
region = region.replace(/\n\/\/[^\n]*Severity config[^\n]*\n/, '\n');
const sevBefore = region;
region = region.replace(/const SEV: Record<Severity[\s\S]*?\n};\n/, '');
if (region === sevBefore) {
  throw new Error('gen-interactions: failed to strip the SEV styling block — check the page.');
}

// Sanity: the pieces the tool wrapper depends on must be present.
for (const needed of ['const SUBSTANCES', 'function findInteraction', 'function getSubstance']) {
  if (!region.includes(needed)) {
    throw new Error(`gen-interactions: expected "${needed}" in the extracted region but it was missing.`);
  }
}

const header =
`// ⚙️  AUTO-GENERATED from src/pages/InteractionCheckerPage.tsx by scripts/gen-interactions.mjs.
//     Do NOT edit by hand — edit the checker page, then run \`npm run gen:interactions\`
//     (also runs automatically on every build via the \`prebuild\` hook).
/* eslint-disable @typescript-eslint/no-unused-vars */
`;

const wrapper = `
// ── AI tool wrapper ───────────────────────────────────────────────
function _resolveId(input: string): string | null {
  const q = input.toLowerCase().trim();
  for (const s of SUBSTANCES) {
    if (s.id === q || s.name.toLowerCase() === q || (s.aliases ?? []).some(a => a.toLowerCase() === q)) return s.id;
  }
  for (const s of SUBSTANCES) {
    if (q.includes(s.id) || q.includes(s.name.toLowerCase()) || (s.aliases ?? []).some(a => q.includes(a.toLowerCase()))) return s.id;
  }
  return null;
}

export function checkStack(names: string[]) {
  const map = new Map<string, string>();
  const unresolved: string[] = [];
  for (const n of (names ?? [])) {
    const id = _resolveId(String(n));
    if (id) map.set(id, getSubstance(id)?.name ?? id);
    else unresolved.push(String(n));
  }
  const ids = [...map.keys()];
  const interactions: Array<Record<string, unknown>> = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const ix = findInteraction(ids[i], ids[j]) as any;
      interactions.push({
        a: map.get(ids[i]), b: map.get(ids[j]),
        severity: ix?.severity ?? 'unknown',
        title: ix?.title ?? null,
        mechanism: ix?.mechanism ?? null,
        recommendation: ix?.recommendation ?? null,
      });
    }
  }
  return { resolved: [...map.values()], unresolved, interactions };
}
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, header + '\n' + region.trimEnd() + '\n' + wrapper, 'utf8');

const subs = (region.match(/\bid:'/g) || []).length;
console.log(`gen-interactions: wrote api/_interactions.ts (${subs} substances, checkStack exported).`);
