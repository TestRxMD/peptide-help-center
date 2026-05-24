-- ═══════════════════════════════════════════════════════════════════
-- Migration: Lab file uploads (storage bucket + lab_files table)
-- Step 1: Run this SQL in Supabase SQL Editor
-- Step 2: Go to Storage → New bucket → name it "lab-results", set to PRIVATE
-- ═══════════════════════════════════════════════════════════════════

-- Track uploaded files per user
create table if not exists lab_files (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade not null,
  file_name    text not null,
  file_path    text not null,   -- storage object path: {userId}/{uuid}.{ext}
  file_size    int,             -- bytes
  file_type    text,            -- MIME type: application/pdf, image/jpeg, etc.
  uploaded_at  timestamptz default now()
);

alter table lab_files enable row level security;

create policy "Users manage own lab files" on lab_files
  for all using (auth.uid() = user_id);

create index lab_files_user_date on lab_files (user_id, uploaded_at desc);

-- ── Storage bucket policies ───────────────────────────────────────
-- Run AFTER creating the "lab-results" bucket in Supabase Storage UI

create policy "Users upload own lab files"
  on storage.objects for insert
  with check (
    bucket_id = 'lab-results'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users view own lab files"
  on storage.objects for select
  using (
    bucket_id = 'lab-results'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own lab files"
  on storage.objects for delete
  using (
    bucket_id = 'lab-results'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
