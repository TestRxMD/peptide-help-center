-- ═══════════════════════════════════════════════════════════════════
-- Migration: Notification preferences + Reminders table
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── Notification preferences on profiles ──────────────────────────
-- notification_channel: null = off, 'email' = email, 'sms' = SMS
alter table profiles
  add column if not exists notification_channel text
    check (notification_channel in ('email', 'sms')),
  add column if not exists notification_phone text;  -- E.164 format, e.g. +15550001234

-- ── Reminders (persisted per user) ────────────────────────────────
create table if not exists reminders (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  peptide_id  text not null,
  time        text not null,      -- 'HH:MM' (24-hour)
  days        text[] not null,    -- ['Mon','Tue','Wed',...]
  dose        text not null,
  route       text not null,
  note        text default '',
  notify      boolean default true,   -- whether this reminder triggers a notification
  enabled     boolean default true,
  created_at  timestamptz default now()
);

alter table reminders enable row level security;

create policy "Users manage own reminders" on reminders
  for all using (auth.uid() = user_id);

create index reminders_user on reminders (user_id, created_at);

-- ═══════════════════════════════════════════════════════════════════
-- To actually SEND notifications you will need:
--   Email: configure Resend (resend.com) + a Vercel/Supabase edge fn
--   SMS:   configure Twilio + a Vercel/Supabase edge fn
--   Cron:  a scheduled job (Vercel Cron / GitHub Actions) that
--          queries reminders WHERE enabled=true AND notify=true
--          and fires at the correct time in the user's timezone.
-- ═══════════════════════════════════════════════════════════════════
