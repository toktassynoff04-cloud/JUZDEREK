create table if not exists public.learning_mode_analytics (
  student_id text not null,
  topic_id text not null,
  topic_name text not null default '',
  mode text not null,
  starts integer not null default 0,
  completions integer not null default 0,
  score_sum integer not null default 0,
  total_sum integer not null default 0,
  replays integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, topic_id, mode)
);

create table if not exists public.learning_mistake_analytics (
  student_id text not null,
  topic_id text not null,
  topic_name text not null default '',
  mode text not null,
  item_key text not null,
  kind text not null default '',
  item_label text not null default '',
  answer_label text not null default '',
  wrong_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, topic_id, mode, item_key)
);

create index if not exists learning_mode_topic_idx on public.learning_mode_analytics(topic_id);
create index if not exists learning_mode_updated_idx on public.learning_mode_analytics(updated_at desc);
create index if not exists learning_mistake_topic_idx on public.learning_mistake_analytics(topic_id);
create index if not exists learning_mistake_wrong_idx on public.learning_mistake_analytics(wrong_count desc);

alter table public.learning_mode_analytics enable row level security;
alter table public.learning_mistake_analytics enable row level security;
revoke all on table public.learning_mode_analytics from anon, authenticated;
revoke all on table public.learning_mistake_analytics from anon, authenticated;

comment on table public.learning_mode_analytics is 'Compact per-student/topic/mode cumulative learning-quality snapshot; no raw click history.';
comment on table public.learning_mistake_analytics is 'Compact per-student/item cumulative mistake counters for difficulty analytics.';