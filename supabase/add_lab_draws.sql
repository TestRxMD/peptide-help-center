-- ═══════════════════════════════════════════════════════════════════
-- Migration: Add lab_draws table
-- Run in Supabase SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

create table if not exists lab_draws (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  drawn_date  date not null,
  marker      text not null,       -- e.g. 'IGF-1', 'Total Testosterone'
  category    text,                -- 'GH Axis','Hormones','Thyroid','Metabolic','Inflammation','Vitamins'
  value       float not null,
  unit        text not null,       -- e.g. 'ng/mL', 'ng/dL'
  ref_low     float,               -- optional reference range low
  ref_high    float,               -- optional reference range high
  notes       text,
  created_at  timestamptz default now()
);

alter table lab_draws enable row level security;
create policy "Users manage own lab draws" on lab_draws
  for all using (auth.uid() = user_id);

create index lab_draws_user_marker on lab_draws (user_id, marker, drawn_date desc);
create index lab_draws_user_date   on lab_draws (user_id, drawn_date desc);
