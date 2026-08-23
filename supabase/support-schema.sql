create extension if not exists pgcrypto;

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique check (char_length(student_id) between 20 and 80),
  username text not null default 'Оқушы' check (char_length(username) between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  last_sender text not null default 'student' check (last_sender in ('student','admin')),
  unread_admin boolean not null default true
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender text not null check (sender in ('student','admin')),
  kind text check (kind is null or kind in ('question','suggestion')),
  body text not null check (char_length(body) between 1 and 1500),
  page text,
  created_at timestamptz not null default now()
);

create index if not exists support_conversations_last_idx on public.support_conversations (last_message_at desc);
create index if not exists support_conversations_unread_idx on public.support_conversations (unread_admin, last_message_at desc);
create index if not exists support_messages_conversation_idx on public.support_messages (conversation_id, created_at asc);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

-- Browser clients never access Supabase directly.
-- Vercel functions use SUPABASE_SERVICE_ROLE_KEY and expose only validated endpoints.
