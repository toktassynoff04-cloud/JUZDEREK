create table if not exists public.student_analytics (
  student_id text primary key,
  username text not null default 'Оқушы',
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  last_page text not null default '/',
  page_views integer not null default 0,
  sessions integer not null default 0,
  xp integer not null default 0,
  games integer not null default 0,
  correct integer not null default 0,
  mastered_topics integer not null default 0,
  streak integer not null default 0
);

create index if not exists student_analytics_last_seen_idx on public.student_analytics(last_seen desc);

alter table public.student_analytics enable row level security;
revoke all on table public.student_analytics from anon, authenticated;

comment on table public.student_analytics is 'One lightweight snapshot row per JUZDEREK browser/student. No click-event history is stored.';