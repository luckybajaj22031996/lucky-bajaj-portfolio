-- keepalive: a single-row table pinged by the GitHub Actions cron so the
-- Supabase free-tier inactivity timer never runs out.
--
-- Supabase pauses Free Plan projects after 7 days with no *database* activity.
-- The chat edge function only proxies to Groq and never touches Postgres, so
-- it does not reset that timer. A scheduled SELECT against this table does.
--
-- If you are not using the Supabase CLI, just paste this whole file into the
-- SQL Editor in the dashboard and run it once.

create table if not exists public.keepalive (
  id         smallint primary key default 1,
  last_ping  timestamptz not null default now(),
  constraint keepalive_singleton check (id = 1)
);

insert into public.keepalive (id) values (1)
  on conflict (id) do nothing;

-- RLS on, with a read-only policy for the public anon role. The cron reads
-- this table with the anon key (same key already shipped in the frontend),
-- so no service-role secret is needed.
alter table public.keepalive enable row level security;

drop policy if exists "Allow anon read for keepalive" on public.keepalive;
create policy "Allow anon read for keepalive"
  on public.keepalive
  for select
  to anon
  using (true);
