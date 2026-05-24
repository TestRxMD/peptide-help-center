-- ═══════════════════════════════════════════════════════════════════
-- Peptide Help Center — Supabase Database Schema
-- Run this in your Supabase project: SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. USER PROFILES ──────────────────────────────────────────────
create table if not exists profiles (
  id            uuid references auth.users on delete cascade primary key,
  age_range     text,                         -- '18-24','25-34','35-44','45-54','55+'
  sex           text,                         -- 'Male','Female','Other','Prefer not to say'
  weight_kg     float,
  primary_goal  text,                         -- 'healing','gh','cognitive','longevity',etc.
  experience    text,                         -- 'First time','Some experience','Experienced'
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile row on new user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ── 2. PROGRESS LOG ───────────────────────────────────────────────
create table if not exists progress_entries (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade not null,
  logged_date   date not null,
  peptide_id    text not null,
  peptide_name  text,
  dose          text,
  route         text,
  notes         text,
  rating        int check (rating between 1 and 5),
  created_at    timestamptz default now()
);

alter table progress_entries enable row level security;
create policy "Users manage own progress" on progress_entries
  for all using (auth.uid() = user_id);

create index progress_entries_user_date on progress_entries (user_id, logged_date desc);


-- ── 3. AI CONVERSATIONS ───────────────────────────────────────────
create table if not exists ai_conversations (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade not null,
  session_id    uuid not null,               -- groups a full back-and-forth session
  role          text check (role in ('user','assistant')) not null,
  content       text not null,
  created_at    timestamptz default now()
);

alter table ai_conversations enable row level security;
create policy "Users manage own conversations" on ai_conversations
  for all using (auth.uid() = user_id);

create index ai_conversations_user_session on ai_conversations (user_id, session_id, created_at);


-- ── 4. PROTOCOL REQUESTS (Protocol Builder tab) ───────────────────
create table if not exists protocol_requests (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users on delete cascade not null,
  goal                text,
  experience          text,
  budget              text,
  concerns            text,
  contraindications   text,
  protocol_generated  text,                  -- full AI response
  created_at          timestamptz default now()
);

alter table protocol_requests enable row level security;
create policy "Users manage own protocols" on protocol_requests
  for all using (auth.uid() = user_id);


-- ── 5. PEPTIDE VIEWS (analytics — works for anonymous too) ────────
create table if not exists peptide_views (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete set null,  -- null = anonymous
  peptide_id    text not null,
  peptide_name  text,
  source        text,                         -- 'wiki','search','compare'
  viewed_at     timestamptz default now()
);

alter table peptide_views enable row level security;
create policy "Anyone can insert peptide views" on peptide_views
  for insert with check (true);
create policy "Users can view own peptide views" on peptide_views
  for select using (auth.uid() = user_id);

create index peptide_views_peptide on peptide_views (peptide_id, viewed_at desc);


-- ── 6. SEARCH EVENTS (analytics) ─────────────────────────────────
create table if not exists search_events (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete set null,
  query         text not null,
  results_count int,
  searched_at   timestamptz default now()
);

alter table search_events enable row level security;
create policy "Anyone can insert search events" on search_events
  for insert with check (true);
create policy "Users can view own searches" on search_events
  for select using (auth.uid() = user_id);
