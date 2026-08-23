create extension if not exists pgcrypto;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  student_id text not null check (char_length(student_id) between 20 and 80),
  username text not null default 'Оқушы' check (char_length(username) between 1 and 20),
  kind text not null check (kind in ('question','suggestion')),
  message text not null check (char_length(message) between 20 and 1500),
  page text,
  status text not null default 'open' check (status in ('open','answered')),
  reply text check (reply is null or char_length(reply) between 1 and 1500),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create index if not exists support_tickets_student_created_idx on public.support_tickets (student_id, created_at desc);
create index if not exists support_tickets_status_created_idx on public.support_tickets (status, created_at desc);

alter table public.support_tickets enable row level security;

-- No public policies are created intentionally. The browser never talks to Supabase directly.
-- Vercel server functions use SUPABASE_SERVICE_ROLE_KEY and expose only validated endpoints.
