create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  faith text not null default 'Muslim',
  timezone text not null default 'UTC',
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, entry_date)
);

alter table public.profiles enable row level security;
alter table public.daily_entries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "daily_entries_select_own" on public.daily_entries;
create policy "daily_entries_select_own"
on public.daily_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "daily_entries_insert_own" on public.daily_entries;
create policy "daily_entries_insert_own"
on public.daily_entries
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "daily_entries_update_own" on public.daily_entries;
create policy "daily_entries_update_own"
on public.daily_entries
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.daily_entries to authenticated;