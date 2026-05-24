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

// ── Lab file uploads ──────────────────────────────────────────────

export interface LabFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_at: string;
}

export async function uploadLabFile(userId: string, file: File): Promise<LabFile | null> {
  if (!supabase) return null;
  const ext  = file.name.split('.').pop() ?? 'bin';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('lab-results')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadErr) return null;

  const { data, error } = await supabase
    .from('lab_files')
    .insert({ user_id: userId, file_name: file.name, file_path: path, file_size: file.size, file_type: file.type })
    .select()
    .single();

  if (error) return null;
  return data as LabFile;
}

export async function fetchLabFiles(userId: string): Promise<LabFile[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('lab_files')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });
  return (data ?? []) as LabFile[];
}

export async function getLabFileSignedUrl(filePath: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.storage
    .from('lab-results')
    .createSignedUrl(filePath, 3600); // 1-hour expiry
  return data?.signedUrl ?? null;
}

export async function deleteLabFile(id: string, filePath: string): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from('lab-results').remove([filePath]);
  await supabase.from('lab_files').delete().eq('id', id);
}

// ── Reminders ─────────────────────────────────────────────────────
import type { AdminRoute, Reminder } from '../types';

export async function fetchReminders(userId: string): Promise<Reminder[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id:        r.id as string,
    peptideId: r.peptide_id as string,
    time:      r.time as string,
    days:      r.days as string[],
    dose:      r.dose as string,
    route:     r.route as AdminRoute,
    enabled:   r.enabled as boolean,
    notify:    r.notify as boolean,
    note:      (r.note as string) ?? '',
  }));
}

export async function upsertReminder(
  userId: string,
  reminder: Omit<Reminder, 'id'> & { id?: string }
): Promise<string | null> {
  if (!supabase) return null;
  const row = {
    user_id:    userId,
    peptide_id: reminder.peptideId,
    time:       reminder.time,
    days:       reminder.days,
    dose:       reminder.dose,
    route:      reminder.route,
    note:       reminder.note ?? '',
    notify:     reminder.notify,
    enabled:    reminder.enabled,
  };
  // If id looks like a UUID (from Supabase), update in place
  const isUuid = reminder.id && /^[0-9a-f-]{36}$/.test(reminder.id);
  if (isUuid) {
    const { data } = await supabase
      .from('reminders').update(row)
      .eq('id', reminder.id).eq('user_id', userId)
      .select('id').single();
    return (data as { id: string } | null)?.id ?? null;
  }
  const { data } = await supabase
    .from('reminders').insert(row)
    .select('id').single();
  return (data as { id: string } | null)?.id ?? null;
}

export async function deleteReminderRow(userId: string, id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('reminders').delete().eq('id', id).eq('user_id', userId);
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

// ── Community ─────────────────────────────────────────────────────
import type { CommunityPost, CommunityComment } from '../types';

type RawPost = Record<string, unknown> & {
  community_post_votes: { value: number }[];
  community_comments:   { id: string }[];
};

type RawComment = Record<string, unknown> & {
  community_comment_votes: { value: number }[];
};

function toPost(r: RawPost, _userId?: string, myVotes?: Record<string, 1 | -1>): CommunityPost {
  const score = r.community_post_votes.reduce((s, v) => s + v.value, 0);
  return {
    id:             r.id as string,
    user_id:        r.user_id as string,
    author_display: r.author_display as string,
    title:          r.title as string,
    body:           r.body as string,
    category:       r.category as string,
    peptide_tags:   (r.peptide_tags as string[]) ?? [],
    created_at:     r.created_at as string,
    score,
    comment_count:  r.community_comments.length,
    my_vote:        myVotes ? (myVotes[r.id as string] ?? 0) : 0,
  };
}

function toComment(r: RawComment, _userId?: string, myVotes?: Record<string, 1 | -1>): CommunityComment {
  return {
    id:             r.id as string,
    post_id:        r.post_id as string,
    user_id:        r.user_id as string,
    author_display: r.author_display as string,
    parent_id:      (r.parent_id as string | null) ?? null,
    body:           r.body as string,
    created_at:     r.created_at as string,
    score:          r.community_comment_votes.reduce((s, v) => s + v.value, 0),
    my_vote:        myVotes ? (myVotes[r.id as string] ?? 0) : 0,
    replies:        [],
  };
}

export async function fetchCommunityPosts(opts: {
  category?: string;
  peptideTag?: string;
  sort?: 'hot' | 'new' | 'top';
  limit?: number;
  userId?: string;
}): Promise<CommunityPost[]> {
  if (!supabase) return [];

  let q = supabase
    .from('community_posts')
    .select('*, community_post_votes(value), community_comments(id)')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 40);

  if (opts.category && opts.category !== 'all')
    q = q.eq('category', opts.category);
  if (opts.peptideTag)
    q = q.contains('peptide_tags', [opts.peptideTag]);

  const { data } = await q;
  if (!data) return [];

  // Fetch the user's own votes so we can highlight them
  let myVotes: Record<string, 1 | -1> = {};
  if (opts.userId && data.length > 0) {
    const ids = data.map((p: Record<string, unknown>) => p.id as string);
    const { data: votes } = await supabase
      .from('community_post_votes')
      .select('post_id, value')
      .eq('user_id', opts.userId)
      .in('post_id', ids);
    (votes ?? []).forEach((v: { post_id: string; value: 1 | -1 }) => {
      myVotes[v.post_id] = v.value;
    });
  }

  const posts = (data as RawPost[]).map(r => toPost(r, opts.userId, myVotes));

  // Client-side sort for hot/top since PostgREST can't sort on computed fields
  if (opts.sort === 'top') posts.sort((a, b) => b.score - a.score);
  if (opts.sort === 'hot' || !opts.sort) {
    const now = Date.now();
    posts.sort((a, b) => {
      const hotA = a.score - (now - new Date(a.created_at).getTime()) / 3_600_000 * 0.1;
      const hotB = b.score - (now - new Date(b.created_at).getTime()) / 3_600_000 * 0.1;
      return hotB - hotA;
    });
  }
  return posts;
}

export async function createCommunityPost(
  userId: string,
  authorDisplay: string,
  data: { title: string; body: string; category: string; peptide_tags: string[] }
): Promise<CommunityPost | null> {
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from('community_posts')
    .insert({ user_id: userId, author_display: authorDisplay, ...data })
    .select('*, community_post_votes(value), community_comments(id)')
    .single();
  if (error || !row) return null;
  return toPost(row as RawPost, userId, {});
}

export async function fetchCommunityComments(
  postId: string,
  userId?: string
): Promise<CommunityComment[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from('community_comments')
    .select('*, community_comment_votes(value)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (!data) return [];

  let myVotes: Record<string, 1 | -1> = {};
  if (userId && data.length > 0) {
    const ids = data.map((c: Record<string, unknown>) => c.id as string);
    const { data: votes } = await supabase
      .from('community_comment_votes')
      .select('comment_id, value')
      .eq('user_id', userId)
      .in('comment_id', ids);
    (votes ?? []).forEach((v: { comment_id: string; value: 1 | -1 }) => {
      myVotes[v.comment_id] = v.value;
    });
  }
  return (data as RawComment[]).map(r => toComment(r, userId, myVotes));
}

export async function createCommunityComment(
  userId: string,
  authorDisplay: string,
  data: { post_id: string; body: string; parent_id?: string | null }
): Promise<CommunityComment | null> {
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from('community_comments')
    .insert({ user_id: userId, author_display: authorDisplay, ...data })
    .select('*, community_comment_votes(value)')
    .single();
  if (error || !row) return null;
  return toComment(row as RawComment, userId, {});
}

export async function voteOnPost(
  userId: string, postId: string, value: 1 | -1, currentVote: 1 | -1 | 0
): Promise<1 | -1 | 0> {
  if (!supabase) return 0;
  if (currentVote === value) {
    // Toggle off — remove vote
    await supabase.from('community_post_votes').delete()
      .eq('post_id', postId).eq('user_id', userId);
    return 0;
  }
  await supabase.from('community_post_votes')
    .upsert({ post_id: postId, user_id: userId, value }, { onConflict: 'post_id,user_id' });
  return value;
}

export async function voteOnComment(
  userId: string, commentId: string, value: 1 | -1, currentVote: 1 | -1 | 0
): Promise<1 | -1 | 0> {
  if (!supabase) return 0;
  if (currentVote === value) {
    await supabase.from('community_comment_votes').delete()
      .eq('comment_id', commentId).eq('user_id', userId);
    return 0;
  }
  await supabase.from('community_comment_votes')
    .upsert({ comment_id: commentId, user_id: userId, value }, { onConflict: 'comment_id,user_id' });
  return value;
}

export async function fetchRelatedPosts(peptideTag: string, limit = 3): Promise<CommunityPost[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('community_posts')
    .select('*, community_post_votes(value), community_comments(id)')
    .contains('peptide_tags', [peptideTag])
    .order('created_at', { ascending: false })
    .limit(limit);
  if (!data) return [];
  return (data as RawPost[]).map(r => toPost(r));
}
