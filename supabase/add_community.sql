-- ═══════════════════════════════════════════════════════════════════
-- Migration: Community (posts, comments, votes, display names)
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── Add display_name to profiles ──────────────────────────────────
alter table profiles
  add column if not exists display_name text;   -- user's chosen handle, e.g. "peptide_guru"

-- ── Posts ─────────────────────────────────────────────────────────
create table if not exists community_posts (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users on delete cascade not null,
  author_display  text not null,              -- snapshot: profile.display_name or email prefix
  title           text not null,
  body            text not null,
  category        text not null default 'general',
    -- experience | question | protocol | side-effects | sourcing | general
  peptide_tags    text[] default '{}',        -- peptide IDs, e.g. ['bpc-157']
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table community_posts enable row level security;
create policy "Anyone can read posts"   on community_posts for select using (true);
create policy "Users create own posts"  on community_posts for insert with check (auth.uid() = user_id);
create policy "Users update own posts"  on community_posts for update using (auth.uid() = user_id);
create policy "Users delete own posts"  on community_posts for delete using (auth.uid() = user_id);

create index community_posts_created  on community_posts (created_at desc);
create index community_posts_category on community_posts (category);
create index community_posts_tags     on community_posts using gin (peptide_tags);

-- ── Comments ──────────────────────────────────────────────────────
create table if not exists community_comments (
  id              uuid default gen_random_uuid() primary key,
  post_id         uuid references community_posts on delete cascade not null,
  user_id         uuid references auth.users on delete cascade not null,
  author_display  text not null,
  parent_id       uuid references community_comments on delete cascade, -- null = top-level
  body            text not null,
  created_at      timestamptz default now()
);

alter table community_comments enable row level security;
create policy "Anyone can read comments"  on community_comments for select using (true);
create policy "Users create own comments" on community_comments for insert with check (auth.uid() = user_id);
create policy "Users delete own comments" on community_comments for delete using (auth.uid() = user_id);

create index community_comments_post   on community_comments (post_id, created_at);
create index community_comments_parent on community_comments (parent_id);

-- ── Post votes ────────────────────────────────────────────────────
create table if not exists community_post_votes (
  post_id   uuid references community_posts on delete cascade not null,
  user_id   uuid references auth.users on delete cascade not null,
  value     int not null check (value in (1, -1)),
  primary key (post_id, user_id)
);

alter table community_post_votes enable row level security;
create policy "Anyone can read post votes"  on community_post_votes for select using (true);
create policy "Users manage own post votes" on community_post_votes for all  using (auth.uid() = user_id);

-- ── Comment votes ─────────────────────────────────────────────────
create table if not exists community_comment_votes (
  comment_id  uuid references community_comments on delete cascade not null,
  user_id     uuid references auth.users on delete cascade not null,
  value       int not null check (value in (1, -1)),
  primary key (comment_id, user_id)
);

alter table community_comment_votes enable row level security;
create policy "Anyone can read comment votes"  on community_comment_votes for select using (true);
create policy "Users manage own comment votes" on community_comment_votes for all  using (auth.uid() = user_id);
