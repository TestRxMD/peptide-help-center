import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Returns null when env vars are not yet configured (safe — app still runs)
export const supabase = (url && key) ? createClient(url, key) : null;

// ── Analytics helpers ─────────────────────────────────────────────
// These fire-and-forget — never throw, never block the UI.

export async function trackPeptideView(
  peptideId: string,
  peptideName: string,
  source: 'wiki' | 'search' | 'compare',
  userId?: string
) {
  if (!supabase) return;
  await supabase.from('peptide_views').insert({
    user_id:      userId ?? null,
    peptide_id:   peptideId,
    peptide_name: peptideName,
    source,
  }).then(() => {}); // swallow errors
}

export async function trackSearch(
  query: string,
  resultsCount: number,
  userId?: string
) {
  if (!supabase || query.trim().length < 2) return;
  await supabase.from('search_events').insert({
    user_id:       userId ?? null,
    query:         query.trim(),
    results_count: resultsCount,
  }).then(() => {});
}

export async function saveAIMessage(
  userId: string,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
) {
  if (!supabase) return;
  await supabase.from('ai_conversations').insert({
    user_id:    userId,
    session_id: sessionId,
    role,
    content,
  }).then(() => {});
}

export async function saveProtocolRequest(
  userId: string,
  params: {
    goal: string; experience: string; budget: string;
    concerns: string; contraindications: string;
    protocolGenerated: string;
  }
) {
  if (!supabase) return;
  await supabase.from('protocol_requests').insert({
    user_id:             userId,
    goal:                params.goal,
    experience:          params.experience,
    budget:              params.budget,
    concerns:            params.concerns,
    contraindications:   params.contraindications,
    protocol_generated:  params.protocolGenerated,
  }).then(() => {});
}

// ── Lab Draws ─────────────────────────────────────────────────────

export async function fetchLabDraws(userId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('lab_draws')
    .select('*')
    .eq('user_id', userId)
    .order('drawn_date', { ascending: false });
  return data ?? [];
}

export async function addLabDraw(
  userId: string,
  draw: {
    drawn_date: string; marker: string; category?: string;
    value: number; unit: string;
    ref_low?: number | null; ref_high?: number | null; notes?: string;
  }
) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('lab_draws')
    .insert({ user_id: userId, ...draw })
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function deleteLabDraw(id: string) {
  if (!supabase) return;
  await supabase.from('lab_draws').delete().eq('id', id).then(() => {});
}

// ── Protocol history ──────────────────────────────────────────────

export async function fetchProtocolHistory(userId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('protocol_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return data ?? [];
}

// ── Recent activity summary ───────────────────────────────────────

export async function fetchRecentActivity(userId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', userId)
    .order('logged_date', { ascending: false })
    .limit(10);
  return data ?? [];
}

// ── Top peptide views ─────────────────────────────────────────────

export async function fetchTopPeptideViews(userId: string) {
  if (!supabase) return [];
  const { data } = await supabase
    .from('peptide_views')
    .select('peptide_name')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (!data) return [];
  // count by name
  const counts: Record<string, number> = {};
  data.forEach((r: { peptide_name: string }) => {
    counts[r.peptide_name] = (counts[r.peptide_name] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));
}
