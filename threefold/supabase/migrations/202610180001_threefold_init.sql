-- Threefold v1: Supabase PostgreSQL. Apply in Supabase SQL Editor or CLI migration.
-- SQL is the source of truth; browser clients never receive service-level credentials.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.threefold_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.threefold_participants (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  name text,
  status text not null default 'UNREGISTERED' check (status in ('UNREGISTERED','PENDING_ADULT','OPTED_IN','OPTED_OUT','SUSPENDED')),
  adult_confirmed boolean not null default false,
  consented_at timestamptz, consent_source text,
  opted_out_at timestamptz,
  couple_id uuid,
  pending_action text,
  pending_ref uuid,
  timezone text not null default 'America/Chicago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.threefold_couples (
  id uuid primary key default gen_random_uuid(),
  partner_a uuid not null references public.threefold_participants(id),
  partner_b uuid not null references public.threefold_participants(id),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PAUSED','ENDED')),
  created_at timestamptz not null default now(),
  constraint distinct_partners check (partner_a<>partner_b)
);
alter table public.threefold_participants
  add constraint threefold_participant_couple_fk foreign key (couple_id) references public.threefold_couples(id);
create table if not exists public.threefold_link_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  creator_id uuid not null references public.threefold_participants(id),
  requester_id uuid references public.threefold_participants(id),
  status text not null default 'NEW' check (status in ('NEW','AWAITING_APPROVAL','USED','EXPIRED')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists public.threefold_messages (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.threefold_participants(id),
  couple_id uuid references public.threefold_couples(id),
  direction text not null check(direction in ('IN','OUT')),
  kind text not null,
  body text not null,
  visibility text not null default 'PRIVATE' check(visibility in ('PRIVATE','SHARED')),
  provider_message_id text,
  created_at timestamptz not null default now()
);
create index if not exists threefold_messages_history_idx on public.threefold_messages(participant_id,created_at desc);
create table if not exists public.threefold_whispers (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.threefold_participants(id),
  couple_id uuid references public.threefold_couples(id),
  prompt text not null,
  answer text,
  status text not null default 'PRIVATE' check(status in ('PRIVATE','SHARED')),
  created_at timestamptz not null default now()
);
create table if not exists public.threefold_reminders (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.threefold_participants(id),
  body text not null,
  due_at timestamptz not null,
  status text not null default 'PENDING' check(status in ('PENDING','PROCESSING','QUEUED','CANCELLED')),
  created_at timestamptz not null default now()
);
create index if not exists threefold_reminders_due_idx on public.threefold_reminders(status,due_at);
create table if not exists public.threefold_inbound_events (
  id text primary key,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'PENDING' check(status in ('PENDING','PROCESSING','DONE','REVIEW')),
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists threefold_inbound_pending_idx on public.threefold_inbound_events(status,received_at);
create table if not exists public.threefold_outbox (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.threefold_participants(id),
  phone text not null,
  body text not null,
  kind text not null,
  status text not null default 'QUEUED' check(status in ('QUEUED','PROCESSING','SENT','SUPPRESSED','REVIEW')),
  due_at timestamptz not null default now(),
  provider_message_id text,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists threefold_outbox_pending_idx on public.threefold_outbox(status,due_at);
create table if not exists public.threefold_audit (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.threefold_participants(id),
  action text not null,
  context text,
  created_at timestamptz not null default now()
);
create table if not exists public.threefold_adventures (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check(category in ('DATE','CHALLENGE','DEEP_DIVE','GIFT','WHISPER')),
  description text,
  milestones jsonb not null default '[]'::jsonb,
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.threefold_progress (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.threefold_couples(id),
  adventure_id uuid not null references public.threefold_adventures(id),
  milestone integer not null default 0 check(milestone>=0),
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(couple_id,adventure_id)
);

-- RLS deny-by-default for all public interfaces.
alter table public.threefold_admins enable row level security;
alter table public.threefold_participants enable row level security;
alter table public.threefold_couples enable row level security;
alter table public.threefold_link_codes enable row level security;
alter table public.threefold_messages enable row level security;
alter table public.threefold_whispers enable row level security;
alter table public.threefold_reminders enable row level security;
alter table public.threefold_inbound_events enable row level security;
alter table public.threefold_outbox enable row level security;
alter table public.threefold_audit enable row level security;
alter table public.threefold_adventures enable row level security;
alter table public.threefold_progress enable row level security;

revoke all on public.threefold_admins, public.threefold_participants,
  public.threefold_couples, public.threefold_link_codes, public.threefold_messages,
  public.threefold_whispers, public.threefold_reminders, public.threefold_inbound_events,
  public.threefold_outbox, public.threefold_audit, public.threefold_adventures,
  public.threefold_progress from anon, authenticated;

-- Use security-definer only for privilege checks and queue claiming.
create or replace function public.threefold_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(select 1 from public.threefold_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.threefold_is_admin() from public;
grant execute on function public.threefold_is_admin() to authenticated,service_role;
grant select on public.threefold_admins to authenticated;
create policy threefold_admin_self on public.threefold_admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Admin browser can view *only* counts and audited action metadata, not raw SMS bodies.
-- Do not grant participant, inbound event, outbox or Whisper table SELECT.
grant select on public.threefold_audit to authenticated;
create policy threefold_admin_audit on public.threefold_audit
  for select to authenticated using ((select public.threefold_is_admin()));

create or replace function public.threefold_dashboard_counts()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.threefold_is_admin() then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  return jsonb_build_object(
    'enrolled',(select count(*) from public.threefold_participants where status='OPTED_IN'),
    'pendingConsent',(select count(*) from public.threefold_participants where status='PENDING_ADULT'),
    'optedOut',(select count(*) from public.threefold_participants where status='OPTED_OUT'),
    'activeCouples',(select count(*) from public.threefold_couples where status='ACTIVE'),
    'eventsPending',(select count(*) from public.threefold_inbound_events where status='PENDING'),
    'eventReview',(select count(*) from public.threefold_inbound_events where status='REVIEW'),
    'outboundPending',(select count(*) from public.threefold_outbox where status='QUEUED'),
    'outboundReview',(select count(*) from public.threefold_outbox where status='REVIEW'),
    'remindersPending',(select count(*) from public.threefold_reminders where status='PENDING'),
    'adventureLibrary',(select count(*) from public.threefold_adventures),
    'startedAdventures',(select count(*) from public.threefold_progress)
  );
end;
$$;
revoke all on function public.threefold_dashboard_counts() from public,anon;
grant execute on function public.threefold_dashboard_counts() to authenticated,service_role;

-- Atomic queue claims; uncertain retries go to REVIEW, never automatically resend.
create or replace function public.threefold_claim_events(p_limit integer default 10)
returns setof public.threefold_inbound_events
language sql security definer set search_path = ''
as $$
 with chosen as (
   select id from public.threefold_inbound_events where status='PENDING'
   order by received_at for update skip locked limit least(greatest(p_limit,1),20)
 )
 update public.threefold_inbound_events t set status='PROCESSING'
 from chosen where t.id=chosen.id returning t.*;
$$;
create or replace function public.threefold_claim_outbox(p_limit integer default 10)
returns setof public.threefold_outbox
language sql security definer set search_path = ''
as $$
 with chosen as (
   select id from public.threefold_outbox
   where status='QUEUED' and due_at<=now()
   order by due_at for update skip locked limit least(greatest(p_limit,1),20)
 )
 update public.threefold_outbox t set status='PROCESSING'
 from chosen where t.id=chosen.id returning t.*;
$$;
revoke all on function public.threefold_claim_events(integer) from public,anon,authenticated;
revoke all on function public.threefold_claim_outbox(integer) from public,anon,authenticated;
grant execute on function public.threefold_claim_events(integer) to service_role;
grant execute on function public.threefold_claim_outbox(integer) to service_role;


-- Reminders are claimed atomically to avoid duplicate scheduled SMS during overlapping jobs.
create or replace function public.threefold_claim_reminders(p_limit integer default 15)
returns setof public.threefold_reminders
language sql security definer set search_path = ''
as $
 with chosen as (
   select id from public.threefold_reminders
   where status='PENDING' and due_at<=now()
   order by due_at for update skip locked limit least(greatest(p_limit,1),20)
 )
 update public.threefold_reminders t set status='PROCESSING'
 from chosen where t.id=chosen.id returning t.*;
$;
revoke all on function public.threefold_claim_reminders(integer) from public,anon,authenticated;
grant execute on function public.threefold_claim_reminders(integer) to service_role;

-- During setup, create YOUR admin account under Supabase Auth > Users, then run:
-- insert into public.threefold_admins(user_id)
-- select id from auth.users where email = 'YOUR-ADMIN-EMAIL@EXAMPLE.COM';
-- Never put a participant into threefold_admins.
