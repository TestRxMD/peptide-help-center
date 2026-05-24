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
