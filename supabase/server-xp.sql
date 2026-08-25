-- JUZDEREK server-authoritative XP
-- One compact row per student. No XP event history table is created.

create table if not exists public.student_xp_state (
  student_id text primary key references public.student_analytics(student_id) on delete cascade,
  token_hash text not null default '',
  xp integer not null default 0 check (xp >= 0),
  rewards jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_xp_state enable row level security;
revoke all on table public.student_xp_state from anon, authenticated;

-- Preserve XP already collected before server-side XP is enabled.
insert into public.student_xp_state (student_id, xp)
select student_id, greatest(0, coalesce(xp,0))
from public.student_analytics
on conflict (student_id) do nothing;

create or replace function public.juzderek_award_xp(
  p_student_id text,
  p_token_hash text,
  p_topic_id text,
  p_mode text,
  p_required_mask integer
)
returns table(xp integer, gained integer, mode_awarded boolean, topic_bonus_awarded boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_state public.student_xp_state%rowtype;
  v_mode_bit integer;
  v_mask integer;
  v_new_mask integer;
  v_gain integer := 0;
  v_mode_awarded boolean := false;
  v_bonus_awarded boolean := false;
begin
  if p_student_id is null or length(p_student_id) < 20 or length(p_student_id) > 80 then
    raise exception 'invalid_student_id';
  end if;
  if p_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_token';
  end if;
  if p_topic_id !~ '^[a-z0-9-]{2,80}$' then
    raise exception 'invalid_topic';
  end if;

  v_mode_bit := case p_mode
    when 'cards' then 1
    when 'quiz' then 2
    when 'person' then 4
    when 'chrono' then 8
    else 0
  end;
  if v_mode_bit = 0 then raise exception 'invalid_mode'; end if;
  if p_required_mask not in (11,15) then raise exception 'invalid_required_mask'; end if;
  if (p_required_mask & v_mode_bit) = 0 then raise exception 'mode_not_allowed'; end if;

  insert into public.student_analytics(student_id)
  values (p_student_id)
  on conflict (student_id) do nothing;

  insert into public.student_xp_state(student_id, token_hash, xp)
  select p_student_id, p_token_hash, greatest(0,coalesce(sa.xp,0))
  from public.student_analytics sa where sa.student_id=p_student_id
  on conflict (student_id) do nothing;

  select * into v_state from public.student_xp_state where student_id=p_student_id for update;

  if v_state.token_hash = '' then
    update public.student_xp_state set token_hash=p_token_hash where student_id=p_student_id;
    v_state.token_hash := p_token_hash;
  elsif v_state.token_hash <> p_token_hash then
    raise exception 'student_token_mismatch';
  end if;

  v_mask := coalesce((v_state.rewards ->> p_topic_id)::integer,0);
  v_new_mask := v_mask;

  if (v_mask & v_mode_bit) = 0 then
    v_new_mask := v_new_mask | v_mode_bit;
    v_gain := v_gain + 25;
    v_mode_awarded := true;
  end if;

  -- Bit 16 records that the one-time topic mastery bonus was paid.
  if (v_new_mask & p_required_mask) = p_required_mask and (v_new_mask & 16) = 0 then
    v_new_mask := v_new_mask | 16;
    v_gain := v_gain + 50;
    v_bonus_awarded := true;
  end if;

  if v_new_mask <> v_mask or v_gain > 0 then
    update public.student_xp_state
      set xp=xp+v_gain,
          rewards=jsonb_set(rewards,array[p_topic_id],to_jsonb(v_new_mask),true),
          updated_at=now()
      where student_id=p_student_id
      returning student_xp_state.xp into v_state.xp;
  end if;

  update public.student_analytics
    set xp=v_state.xp,last_seen=now()
    where student_id=p_student_id;

  return query select v_state.xp,v_gain,v_mode_awarded,v_bonus_awarded;
end;
$$;

revoke all on function public.juzderek_award_xp(text,text,text,text,integer) from public, anon, authenticated;
grant execute on function public.juzderek_award_xp(text,text,text,text,integer) to service_role;

comment on table public.student_xp_state is 'Compact server XP snapshot: one row per student; rewards stores topic bitmasks, not event history.';