import { useState, useEffect, useCallback } from 'react';
import type { CommunityPost, CommunityComment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { peptides } from '../data/peptides';
import {
  fetchCommunityPosts, createCommunityPost,
  fetchCommunityComments, createCommunityComment,
  voteOnPost, voteOnComment,
} from '../lib/supabase';

// ── Constants ─────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',          label: 'All Posts',    emoji: '📋' },
  { id: 'experience',   label: 'Experience',   emoji: '💬' },
  { id: 'question',     label: 'Question',     emoji: '❓' },
  { id: 'protocol',     label: 'Protocol',     emoji: '🧪' },
  { id: 'side-effects', label: 'Side Effects', emoji: '⚠️' },
  { id: 'sourcing',     label: 'Sourcing',     emoji: '🏪' },
  { id: 'general',      label: 'General',      emoji: '💭' },
];

const CATEGORY_COLORS: Record<string, string> = {
  experience:    'rgba(59,130,246,0.12)',
  question:      'rgba(168,85,247,0.12)',
  protocol:      'rgba(16,185,129,0.12)',
  'side-effects':'rgba(245,158,11,0.12)',
  sourcing:      'rgba(236,72,153,0.12)',
  general:       'rgba(100,116,139,0.12)',
};
const CATEGORY_BORDER: Record<string, string> = {
  experience:    'rgba(59,130,246,0.3)',
  question:      'rgba(168,85,247,0.3)',
  protocol:      'rgba(16,185,129,0.3)',
  'side-effects':'rgba(245,158,11,0.3)',
  sourcing:      'rgba(236,72,153,0.3)',
  general:       'rgba(100,116,139,0.3)',
};

// ── Helpers ───────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function buildTree(comments: CommunityComment[]): CommunityComment[] {
  const map = new Map<string, CommunityComment>();
  const roots: CommunityComment[] = [];
  comments.forEach(c => map.set(c.id, { ...c, replies: [] }));
  map.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

function authorInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

// ── Vote buttons ──────────────────────────────────────────────────

function VoteButtons({
  score, myVote, onVote, size = 'normal',
}: {
  score: number; myVote: 1 | -1 | 0;
  onVote: (v: 1 | -1) => void;
  size?: 'normal' | 'small';
}) {
  const s = size === 'small';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      <button
        onClick={() => onVote(1)}
        title="Upvote"
        style={{
          width: s ? 24 : 28, height: s ? 24 : 28, borderRadius: 6,
          border: `1px solid ${myVote === 1 ? 'var(--accent)' : 'var(--border)'}`,
          background: myVote === 1 ? 'var(--accent-dim)' : 'var(--bg-input)',
          color: myVote === 1 ? 'var(--accent)' : 'var(--text-muted)',
          fontSize: s ? 11 : 13, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 120ms',
        }}
      >▲</button>
      <span style={{
        fontSize: s ? 11 : 13, fontWeight: 700, lineHeight: 1,
        color: score > 0 ? 'var(--accent)' : score < 0 ? 'var(--red)' : 'var(--text-muted)',
      }}>{score}</span>
      <button
        onClick={() => onVote(-1)}
        title="Downvote"
        style={{
          width: s ? 24 : 28, height: s ? 24 : 28, borderRadius: 6,
          border: `1px solid ${myVote === -1 ? 'var(--red)' : 'var(--border)'}`,
          background: myVote === -1 ? 'rgba(220,38,38,0.08)' : 'var(--bg-input)',
          color: myVote === -1 ? 'var(--red)' : 'var(--text-muted)',
          fontSize: s ? 11 : 13, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 120ms',
        }}
      >▼</button>
    </div>
  );
}

// ── Post card (list view) ─────────────────────────────────────────

function PostCard({ post, onClick, onVote }: {
  post: CommunityPost;
  onClick: () => void;
  onVote: (v: 1 | -1) => void;
}) {
  const cat = CATEGORIES.find(c => c.id === post.category);
  return (
    <div
      className="card"
      style={{ display: 'flex', gap: 14, padding: '14px 16px', cursor: 'pointer', transition: 'box-shadow 150ms' }}
      onClick={onClick}
    >
      {/* Vote column */}
      <div onClick={e => e.stopPropagation()}>
        <VoteButtons score={post.score} myVote={post.my_vote ?? 0} onVote={onVote} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
          {/* Category badge */}
          {cat && cat.id !== 'all' && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
              background: CATEGORY_COLORS[cat.id] ?? 'var(--bg-input)',
              border: `1px solid ${CATEGORY_BORDER[cat.id] ?? 'var(--border)'}`,
              color: 'var(--text-secondary)',
            }}>{cat.emoji} {cat.label}</span>
          )}
          {/* Peptide tags */}
          {post.peptide_tags.slice(0, 3).map(tag => {
            const p = peptides.find(p => p.id === tag);
            return p ? (
              <span key={tag} className="tag" style={{ fontSize: 10 }}>
                {p.emoji} {p.name}
              </span>
            ) : null;
          })}
        </div>

        <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>
          {post.title}
        </div>
        <div style={{
          fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 8,
        }}>
          {post.body}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
            color: '#fff', fontWeight: 700, fontSize: 11,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>{authorInitial(post.author_display)}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{post.author_display}</span>
          <span>·</span>
          <span>💬 {post.comment_count} comments</span>
          <span>·</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Comment item (recursive) ──────────────────────────────────────

function CommentItem({
  comment, depth, onReply, onVote, replyingTo, setReplyingTo, replyBody, setReplyBody, submitReply,
}: {
  comment: CommunityComment;
  depth: number;
  onReply: (id: string) => void;
  onVote: (id: string, v: 1 | -1) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyBody: string;
  setReplyBody: (s: string) => void;
  submitReply: () => void;
}) {
  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, borderLeft: depth > 0 ? '2px solid var(--border)' : 'none', paddingLeft: depth > 0 ? 14 : 0, marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Vote */}
        <div>
          <VoteButtons size="small" score={comment.score} myVote={comment.my_vote ?? 0} onVote={v => onVote(comment.id, v)} />
        </div>
        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
              color: '#fff', fontWeight: 700, fontSize: 10,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{authorInitial(comment.author_display)}</span>
            <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-secondary)' }}>{comment.author_display}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(comment.created_at)}</span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: 6, whiteSpace: 'pre-wrap' }}>
            {comment.body}
          </div>
          {depth < 3 && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              style={{
                fontSize: 11, color: 'var(--text-muted)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '2px 0', fontFamily: 'inherit',
              }}
            >↩ Reply</button>
          )}
          {replyingTo === comment.id && (
            <div style={{ marginTop: 8 }}>
              <textarea
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                placeholder="Write a reply…"
                rows={3}
                style={{
                  width: '100%', fontSize: 13, padding: '8px 10px',
                  borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg-input)', color: 'var(--text-primary)',
                  fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button className="btn btn-primary" onClick={submitReply} style={{ fontSize: 12, padding: '6px 14px' }}>
                  Post reply
                </button>
                <button className="btn btn-ghost" onClick={() => setReplyingTo(null)} style={{ fontSize: 12 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Nested replies */}
      {(comment.replies ?? []).map(reply => (
        <CommentItem
          key={reply.id} comment={reply} depth={depth + 1}
          onReply={onReply} onVote={onVote}
          replyingTo={replyingTo} setReplyingTo={setReplyingTo}
          replyBody={replyBody} setReplyBody={setReplyBody}
          submitReply={submitReply}
        />
      ))}
    </div>
  );
}

// ── Post detail view ──────────────────────────────────────────────

function PostDetail({
  post, onBack, onVotePost, comments, loadingComments,
  onVoteComment, onAddComment, user,
}: {
  post: CommunityPost;
  onBack: () => void;
  onVotePost: (v: 1 | -1) => void;
  comments: CommunityComment[];
  loadingComments: boolean;
  onVoteComment: (id: string, v: 1 | -1) => void;
  onAddComment: (body: string, parentId?: string | null) => Promise<void>;
  user: { id: string; email?: string } | null;
}) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  const cat = CATEGORIES.find(c => c.id === post.category);
  const tree = buildTree(comments);

  const handleSubmitTop = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    await onAddComment(newComment.trim(), null);
    setNewComment('');
    setSubmitting(false);
  };

  const handleSubmitReply = async () => {
    if (!replyBody.trim() || !replyingTo) return;
    await onAddComment(replyBody.trim(), replyingTo);
    setReplyBody('');
    setReplyingTo(null);
  };

  return (
    <div>
      {/* Back */}
      <button
        className="btn btn-ghost"
        onClick={onBack}
        style={{ marginBottom: 16, fontSize: 13 }}
      >← Back to posts</button>

      {/* Post */}
      <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(31,64,204,0.2)' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <VoteButtons score={post.score} myVote={post.my_vote ?? 0} onVote={onVotePost} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category + tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {cat && cat.id !== 'all' && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                  background: CATEGORY_COLORS[cat.id] ?? 'var(--bg-input)',
                  border: `1px solid ${CATEGORY_BORDER[cat.id] ?? 'var(--border)'}`,
                  color: 'var(--text-secondary)',
                }}>{cat.emoji} {cat.label}</span>
              )}
              {post.peptide_tags.map(tag => {
                const p = peptides.find(p => p.id === tag);
                return p ? <span key={tag} className="tag" style={{ fontSize: 10 }}>{p.emoji} {p.name}</span> : null;
              })}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.3 }}>
              {post.title}
            </h2>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14, whiteSpace: 'pre-wrap' }}>
              {post.body}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
                color: '#fff', fontWeight: 700, fontSize: 12,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{authorInitial(post.author_display)}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{post.author_display}</span>
              <span>·</span>
              <span>{timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* New comment box */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
          💬 {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </div>
        {user ? (
          <>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts, experience, or question…"
              rows={3}
              style={{
                width: '100%', fontSize: 13.5, padding: '10px 12px',
                borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--bg-input)', color: 'var(--text-primary)',
                fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSubmitTop}
              disabled={submitting || !newComment.trim()}
              style={{ marginTop: 8, opacity: (submitting || !newComment.trim()) ? 0.6 : 1 }}
            >
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '10px 0' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Sign in</strong> to join the discussion.
          </div>
        )}
      </div>

      {/* Comment tree */}
      {loadingComments ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>Loading comments…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tree.map(c => (
            <CommentItem
              key={c.id} comment={c} depth={0}
              onReply={id => setReplyingTo(id)}
              onVote={onVoteComment}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              submitReply={handleSubmitReply}
            />
          ))}
          {tree.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              No comments yet. Be the first to share!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── New Post Form ─────────────────────────────────────────────────

function NewPostForm({ onSubmit, onCancel }: {
  onSubmit: (data: { title: string; body: string; category: string; peptide_tags: string[] }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title,       setTitle]       = useState('');
  const [body,        setBody]        = useState('');
  const [category,    setCategory]    = useState('experience');
  const [tagSearch,   setTagSearch]   = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting,  setSubmitting]  = useState(false);

  const filteredPeptides = peptides.filter(p =>
    p.name.toLowerCase().includes(tagSearch.toLowerCase()) && !selectedTags.includes(p.id)
  ).slice(0, 6);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    await onSubmit({ title: title.trim(), body: body.trim(), category, peptide_tags: selectedTags });
    setSubmitting(false);
  };

  return (
    <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(31,64,204,0.3)' }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>
        ✍️ New Post
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Category
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                style={{
                  padding: '5px 11px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: category === c.id ? CATEGORY_COLORS[c.id] ?? 'var(--accent-dim)' : 'var(--bg-input)',
                  border: `1px solid ${category === c.id ? (CATEGORY_BORDER[c.id] ?? 'var(--accent)') : 'var(--border)'}`,
                  color: category === c.id ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >{c.emoji} {c.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What's your post about?"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Body</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your experience, question, or protocol…"
            rows={5}
            style={{
              width: '100%', fontSize: 13.5, padding: '10px 12px',
              borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-input)', color: 'var(--text-primary)',
              fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Peptide tags */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tag Peptides (optional)
          </label>
          {selectedTags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {selectedTags.map(id => {
                const p = peptides.find(p => p.id === id);
                return p ? (
                  <span key={id} className="tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {p.emoji} {p.name}
                    <button
                      onClick={() => setSelectedTags(prev => prev.filter(t => t !== id))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, fontSize: 12, lineHeight: 1 }}
                    >×</button>
                  </span>
                ) : null;
              })}
            </div>
          )}
          <input
            value={tagSearch}
            onChange={e => setTagSearch(e.target.value)}
            placeholder="Search peptides to tag…"
          />
          {tagSearch && filteredPeptides.length > 0 && (
            <div style={{
              marginTop: 4, border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg-surface)', overflow: 'hidden',
            }}>
              {filteredPeptides.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedTags(prev => [...prev, p.id]); setTagSearch(''); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '8px 12px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'inherit',
                    borderBottom: '1px solid var(--border)',
                  }}
                >{p.emoji} {p.name}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || !body.trim()}
            style={{ opacity: (submitting || !title.trim() || !body.trim()) ? 0.6 : 1 }}
          >
            {submitting ? 'Posting…' : 'Post to Community'}
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function CommunityPage() {
  const { user, profile } = useAuth();

  const [view,        setView]        = useState<'list' | 'post'>('list');
  const [activePost,  setActivePost]  = useState<CommunityPost | null>(null);
  const [posts,       setPosts]       = useState<CommunityPost[]>([]);
  const [comments,    setComments]    = useState<CommunityComment[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingCmts, setLoadingCmts] = useState(false);
  const [category,    setCategory]    = useState('all');
  const [sort,        setSort]        = useState<'hot' | 'new' | 'top'>('hot');
  const [showNewPost, setShowNewPost] = useState(false);

  // Derive the author display name from their profile or email
  const authorDisplay = profile?.display_name
    || user?.email?.split('@')[0]
    || 'Member';

  // Handle deep-linked post URLs (/community/[id])
  useEffect(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts[0] === 'community' && parts[1]) {
      // We'll open it after posts load — handled below
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const data = await fetchCommunityPosts({ category, sort, userId: user?.id });
    setPosts(data);
    setLoading(false);
  }, [category, sort, user?.id]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const openPost = useCallback(async (post: CommunityPost) => {
    setActivePost(post);
    setView('post');
    window.history.pushState(null, '', `/community/${post.id}`);
    setLoadingCmts(true);
    const data = await fetchCommunityComments(post.id, user?.id);
    setComments(data);
    setLoadingCmts(false);
  }, [user?.id]);

  const goBack = () => {
    setView('list');
    setActivePost(null);
    setComments([]);
    window.history.pushState(null, '', '/community');
  };

  const handleVotePost = async (postId: string, v: 1 | -1, currentVote: 1 | -1 | 0) => {
    if (!user) return;
    const newVote = await voteOnPost(user.id, postId, v, currentVote);
    const delta = newVote - currentVote;
    const update = (p: CommunityPost) => p.id === postId
      ? { ...p, score: p.score + delta, my_vote: newVote as 1 | -1 | 0 }
      : p;
    setPosts(prev => prev.map(update));
    if (activePost?.id === postId) setActivePost(prev => prev ? update(prev) : prev);
  };

  const handleVoteComment = async (commentId: string, v: 1 | -1) => {
    if (!user) return;
    const target = comments.find(c => c.id === commentId);
    if (!target) return;
    const newVote = await voteOnComment(user.id, commentId, v, target.my_vote ?? 0);
    const delta = newVote - (target.my_vote ?? 0);
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, score: c.score + delta, my_vote: newVote as 1 | -1 | 0 } : c
    ));
  };

  const handleAddComment = async (body: string, parentId?: string | null) => {
    if (!user || !activePost) return;
    const comment = await createCommunityComment(user.id, authorDisplay, {
      post_id: activePost.id, body, parent_id: parentId ?? null,
    });
    if (!comment) return;
    setComments(prev => [...prev, comment]);
    // Update comment count on active post
    setActivePost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev);
  };

  const handleCreatePost = async (data: { title: string; body: string; category: string; peptide_tags: string[] }) => {
    if (!user) return;
    const post = await createCommunityPost(user.id, authorDisplay, data);
    if (!post) return;
    setShowNewPost(false);
    await openPost(post);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            💬 Community
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
            Share experiences, ask questions, and discuss peptide protocols with the community.
          </p>
        </div>
        {view === 'list' && (
          <button
            className="btn btn-primary"
            onClick={() => { if (user) setShowNewPost(v => !v); else window.dispatchEvent(new CustomEvent('open-auth')); }}
          >
            {showNewPost ? '✕ Cancel' : '✍️ New Post'}
          </button>
        )}
      </div>

      {/* New post form */}
      {showNewPost && view === 'list' && (
        <NewPostForm onSubmit={handleCreatePost} onCancel={() => setShowNewPost(false)} />
      )}

      {/* List view */}
      {view === 'list' && (
        <>
          {/* Filters row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 4, flex: 1, overflowX: 'auto', flexWrap: 'nowrap' }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: category === c.id ? 700 : 500,
                    whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                    background: category === c.id ? 'var(--accent-dim)' : 'var(--bg-input)',
                    border: `1px solid ${category === c.id ? 'var(--accent)' : 'var(--border)'}`,
                    color: category === c.id ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >{c.emoji} {c.label}</button>
              ))}
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as 'hot' | 'new' | 'top')}
              style={{ fontSize: 12, padding: '5px 10px', width: 'auto', flexShrink: 0 }}
            >
              <option value="hot">🔥 Hot</option>
              <option value="new">🆕 New</option>
              <option value="top">⭐ Top</option>
            </select>
          </div>

          {/* Post list */}
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 13 }}>
              Loading posts…
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No posts yet</div>
              <div style={{ fontSize: 13 }}>Be the first to start a discussion!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => openPost(post)}
                  onVote={v => handleVotePost(post.id, v, post.my_vote ?? 0)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Post detail view */}
      {view === 'post' && activePost && (
        <PostDetail
          post={activePost}
          onBack={goBack}
          onVotePost={v => handleVotePost(activePost.id, v, activePost.my_vote ?? 0)}
          comments={comments}
          loadingComments={loadingCmts}
          onVoteComment={handleVoteComment}
          onAddComment={handleAddComment}
          user={user}
        />
      )}

      {/* Guest banner */}
      {!user && view === 'list' && (
        <div style={{
          marginTop: 24, padding: '14px 18px',
          background: 'var(--accent-dim)', border: '1px solid rgba(31,64,204,0.2)',
          borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong>Sign in</strong> to post, comment, and vote. Reading is always free.
          </div>
        </div>
      )}
    </div>
  );
}
