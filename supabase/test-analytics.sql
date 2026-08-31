create table if not exists public.test_attempt_analytics (
  student_id text not null,
  test_id text not null,
  test_title text not null default '',
  username text not null default '',
  attempts integer not null default 0,
  score_sum integer not null default 0,
  max_score_sum integer not null default 0,
  best_score integer not null default 0,
  best_max_score integer not null default 0,
  last_score integer not null default 0,
  last_max_score integer not null default 0,
  completed_at timestamptz not null default now(),
  primary key (student_id, test_id)
);

create table if not exists public.test_question_analytics (
  test_id text not null,
  test_title text not null default '',
  question_id text not null,
  question_number integer not null default 0,
  attempts integer not null default 0,
  full_correct integer not null default 0,
  score_sum integer not null default 0,
  max_score_sum integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (test_id, question_id)
);

create index if not exists test_attempt_test_idx on public.test_attempt_analytics(test_id);
create index if not exists test_attempt_completed_idx on public.test_attempt_analytics(completed_at desc);
create index if not exists test_question_test_idx on public.test_question_analytics(test_id);

alter table public.test_attempt_analytics enable row level security;
alter table public.test_question_analytics enable row level security;
revoke all on table public.test_attempt_analytics from anon, authenticated;
revoke all on table public.test_question_analytics from anon, authenticated;

comment on table public.test_attempt_analytics is 'Compact per-student/per-test cumulative repeat-test analytics.';
comment on table public.test_question_analytics is 'Aggregated per-question repeat-test analytics; no raw answer history.';