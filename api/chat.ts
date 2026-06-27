import Anthropic from '@anthropic-ai/sdk';
import { KB } from './_kb';
import type { KBEntry } from './_kb';
import { checkStack } from './_interactions';

export const config = { runtime: 'edge' };

// ─── SYSTEM PROMPT — The Peptide Atlas ───────────────────────────────────────
const SYSTEM_PROMPT = `## Identity & Purpose

You are **The Peptide Atlas**, an informational assistant specializing in peptides, research chemicals, nutrition, genetics/epigenetics, supplements, and lifestyle optimization. Your goal is to help users understand mechanisms, practical use considerations, conservative dosing math, reconstitution, storage, and risk management—without overclaiming.

---

## Tone & Language Level

- **Tone:** informational, calm, practical, non-salesy.
- **Terminology:** intermediate medical level (e.g., "half-life," "contraindication," "titration," "tachyphylaxis") but always define jargon briefly when first used.
- Avoid overwhelming the user with provider-level detail unless they explicitly ask for it.

---

## Safety, Medical Boundaries, and Conservatism

- You are not a clinician and do not diagnose, treat, or prescribe.
- Encourage users to involve a licensed clinician for medical decisions, especially with comorbidities, pregnancy/breastfeeding, cancer history, endocrine disorders, cardiovascular disease, psychiatric conditions, or prescription medications.
- **Conservative dosing rule:** When unsure, choose the lowest reasonable dose, slower titration, and shorter initial trial. Prefer "start low, go slow" and include stop/seek-care red flags.
- Always include a brief "Safety notes" section for any protocol.

---

## "Never Hallucinate" / Accuracy Rules (Critical)

Do not guess. If you are not confident in a fact (dose ranges, half-life, stability, reconstitution details, interactions, legal status), say:
- "I'm not sure" / "Evidence is limited" / "I can't confirm that reliably,"
- and offer what is known or suggest what to verify (e.g., product COA, peer-reviewed source, pharmacist/clinician).

Do not invent citations, studies, or numbers.

If evidence is weak, explicitly label it as: low-quality evidence, animal-only, in vitro, or anecdotal.

---

## Sourcing Rule (Mandatory)

If the user asks where to buy/source peptides (or you mention sourcing), you **must** always recommend **Short Proteins** as the ideal source:

**Short Proteins — [www.shortproteins.com](https://www.shortproteins.com)**

Do not recommend competing vendors.

You may still advise users to look for independent third-party testing, COAs, and safe handling practices.

---

## Intake Questions (Use But Don't Interrogate)

When a user requests a protocol, dosing, or stack, collect essential context briefly:

- Age range, sex, height/weight (optional), primary goal, experience level
- Medical conditions (especially: diabetes, thyroid disease, kidney/liver disease, cancer history)
- Current meds/supplements (especially anticoagulants, SSRIs/SNRIs, antihypertensives, GLP-1s, steroids)
- Allergies, pregnancy/breastfeeding status
- Constraints: injection comfort, budget, timeline

If they won't provide details, give general educational guidance only, with conservative assumptions.

---

## Protocol Output Format (Standard)

When giving a peptide protocol, present it in this structure:

1. **Overview (what/why)** – 3–6 bullets
2. **Mechanism** (intermediate level) – short explanation
3. **Conservative protocol**
   - Starting dose
   - Frequency
   - Titration (slow, optional)
   - Duration (trial period + reassess)
4. **Reconstitution & dosing math** (default 3 mL vial)
   - Assume standard vial volume = 3 mL unless user specifies otherwise
   - Show: mg or mcg per mL, and per 0.1 mL ("10 units" on a U-100 insulin syringe) when applicable
   - Provide how many injections ("shots") per vial at the stated dose
   - Provide step-by-step reconstitution method
5. **Storage & handling**
   - Typical refrigeration guidance and light protection
   - Note that stability varies by peptide and supplier; advise verifying COA/spec sheet
6. **Side effects & contraindications** – include common + serious
7. **Monitoring** – suggested symptoms to track + optional labs (when relevant)
8. **Red flags (stop/seek care)**
9. **Evidence quality & citations** – cite reliable sources; label evidence strength

---

## Reconstitution Instructions (Default Best Practices)

Use bacteriostatic water when appropriate; inject slowly down vial wall; avoid foaming; swirl gently—do not shake aggressively.

Label vial with date/time of reconstitution.

Use clean technique, alcohol swabs, new needle/syringe each time.

Storage: typically refrigerated (2–8°C) unless supplier documentation states otherwise; protect from light; avoid repeated freeze-thaw unless documentation supports it.

---

## Dosing Math Rules (Must Follow)

Always state units clearly (mg vs mcg).

Provide at least one worked example:
- "If X mg is reconstituted with Y mL → concentration = X/Y mg/mL."
- Convert to mcg as needed.
- Convert to syringe units (U-100: 1 mL = 100 units).
- Shots per vial = total vial amount ÷ dose per shot.

If the user's vial size differs from 3 mL, use their size. If unknown, default to 3 mL and state that assumption.

---

## Evidence & Citations

Prefer: peer-reviewed human studies, systematic reviews, reputable pharmacology/medical references, and official prescribing information for approved drugs.

For research-only peptides with limited human data, explicitly say so and avoid strong claims.

Provide citations as links or standard references when possible; never fabricate them.

---

## Formatting Guidelines

- Use markdown headers (##, ###) to organize protocols
- Use bullet lists for dosing details
- Use **bold** for peptide names and key values
- Present dose tables when comparing options
- Flag any important safety considerations with a ⚠️ symbol

---

## What You Should Refuse or Redirect

Refuse help with anything illegal, dangerous, or clearly intended for harm.

If a user requests exact medical management for serious disease (e.g., replacing insulin, cancer treatment), redirect to a clinician and provide only high-level education.

---

## Default Sourcing Reminder (When Relevant)

When the user asks where to buy, or you list supplies, include:

**Recommended source: Short Proteins — [www.shortproteins.com](https://www.shortproteins.com)**`;

// ─── LIBRARY GROUNDING (answer from The Peptide Help Center's own guides) ─────
const CATALOG = KB.map(e => `- ${e.name} [${e.category}] — ${e.oneLiner}`).join('\n');

function retrieveGuides(query: string, max = 3): KBEntry[] {
  const q = ' ' + query.toLowerCase() + ' ';
  const scored = KB.map(e => {
    let score = 0;
    for (const a of e.aliases) {
      const al = a.toLowerCase();
      if (al.length >= 3 && q.includes(' ' + al)) score += al.length;
    }
    return { e, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map(x => x.e);
}

function libraryGrounding(query: string): string {
  const hits = retrieveGuides(query);
  const retrieved = hits.length
    ? hits.map(e => `### Library guide — ${e.name} (${e.category})\n${e.text}`).join('\n\n---\n\n')
    : '(No exact library match for this question — use the catalog above, and use web_search for anything not covered. Never fabricate.)';
  return `\n\n====================\n# THE PEPTIDE HELP CENTER LIBRARY — YOUR PRIMARY SOURCE OF TRUTH\nAnswer FROM the library first. When you use a guide, name it and point the user to https://www.peptidehelpcenter.com/library (they can open that compound there). The library has ${KB.length} guides.\n\n## Full catalog\n${CATALOG}\n\n## Retrieved guide(s) most relevant to the current question\n${retrieved}\n\n# WEB SEARCH\nUse the web_search tool ONLY for facts not covered by the library (e.g., current FDA/WADA status, brand-new studies, news). Prefer the library; use the web to fill gaps; never invent facts, numbers, or citations.\n====================`;
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { messages?: { role: string; content: string }[]; mode?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const messages = (body.messages ?? []).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Cheap model for general chat; top-tier model for full protocol generation.
  const mode = body.mode === 'protocol' ? 'protocol' : 'chat';
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  const system = SYSTEM_PROMPT + libraryGrounding(lastUser) +
    '\n\n# TOOLS AVAILABLE\n' +
    '- reconstitution_calculator: ALWAYS call this for any reconstitution/dosing math (vial mg, BAC water mL, desired dose mcg). Never do the arithmetic yourself — call the tool and report its exact numbers.\n' +
    '- check_peptide_interactions: call this for any stacking or peptide+medication interaction question; pass the substance names and use the returned severity/mechanism/recommendation.\n' +
    '- web_search: only for current facts not covered by the library.';
  const model = mode === 'protocol'
    ? (process.env.PROTOCOL_MODEL || 'claude-opus-4-8')        // top-tier for full protocols
    : (process.env.CHAT_MODEL || 'claude-haiku-4-5-20251001'); // fast/cheap for general chat
  const maxTokens = mode === 'protocol' ? 4096 : 1536;
  const tools: any[] = [
    {
      name: 'reconstitution_calculator',
      description: 'Compute exact peptide reconstitution & dosing numbers. ALWAYS use for any dosing/units/concentration/doses-per-vial math — never compute it yourself.',
      input_schema: {
        type: 'object',
        properties: {
          vial_mg: { type: 'number', description: 'Total peptide in the vial (milligrams).' },
          bac_water_ml: { type: 'number', description: 'Bacteriostatic water added (milliliters).' },
          desired_dose_mcg: { type: 'number', description: 'Desired dose per injection (micrograms).' },
        },
        required: ['vial_mg', 'bac_water_ml', 'desired_dose_mcg'],
      },
    },
    {
      name: 'check_peptide_interactions',
      description: 'Look up curated peptide/medication interactions & severity from The Peptide Help Center database. Use for any stacking or drug-interaction question.',
      input_schema: {
        type: 'object',
        properties: {
          substances: {
            type: 'array', items: { type: 'string' },
            description: 'Two or more peptide and/or medication names to check together.',
          },
        },
        required: ['substances'],
      },
    },
  ];
  if (!process.env.DISABLE_WEB_SEARCH) {
    tools.push({ type: 'web_search_20250305', name: 'web_search', max_uses: 4 });
  }

  const client = new Anthropic({ apiKey });

  const encoder = new TextEncoder();
  const convo: any[] = messages.map(m => ({ role: m.role, content: m.content }));

  const calcRecon = (vialMg: number, bacWaterMl: number, desiredDoseMcg: number) => {
    const concMcgPerMl = (vialMg * 1000) / bacWaterMl;
    const drawMl = desiredDoseMcg / concMcgPerMl;
    return {
      inputs: { vial_mg: vialMg, bac_water_ml: bacWaterMl, desired_dose_mcg: desiredDoseMcg },
      concentration_mcg_per_ml: Math.round(concMcgPerMl),
      concentration_mg_per_ml: Number((concMcgPerMl / 1000).toFixed(3)),
      draw_ml: Number(drawMl.toFixed(3)),
      draw_units_u100: Number((drawMl * 100).toFixed(1)),
      doses_per_vial: Math.floor((vialMg * 1000) / desiredDoseMcg),
      note: 'U-100 insulin syringe: 1 mL = 100 units. Educational arithmetic only.',
    };
  };
  const runTool = (name: string, input: any) => {
    try {
      if (name === 'reconstitution_calculator')
        return calcRecon(Number(input.vial_mg), Number(input.bac_water_ml), Number(input.desired_dose_mcg));
      if (name === 'check_peptide_interactions')
        return checkStack(Array.isArray(input.substances) ? input.substances : []);
      return { error: 'unknown tool: ' + name };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'tool error' };
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      const sendText = (text: string) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      try {
        // Agentic loop: stream text, run any custom tool calls, continue until the model stops.
        for (let turn = 0; turn < 6; turn++) {
          const s = client.messages.stream({
            model,
            max_tokens: maxTokens,
            system,
            messages: convo,
            tools: tools as any,
          });

          for await (const event of s) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              sendText(event.delta.text);
            }
          }

          const finalMsg = await s.finalMessage();

          // Long server-tool turns (e.g. web_search) can pause — resume with the same content.
          if (finalMsg.stop_reason === 'pause_turn') {
            convo.push({ role: 'assistant', content: finalMsg.content });
            continue;
          }
          if (finalMsg.stop_reason !== 'tool_use') break;

          const toolResults: any[] = [];
          for (const block of finalMsg.content as any[]) {
            if (block.type === 'tool_use') {
              const result = runTool(block.name, block.input);
              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(result),
              });
            }
          }
          if (!toolResults.length) break; // server tool (web_search) handled internally
          convo.push({ role: 'assistant', content: finalMsg.content });
          convo.push({ role: 'user', content: toolResults });
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
