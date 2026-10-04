-- VPA CRM: foundation for workspaces, imports, contacts, branches, activities,
-- Microsoft calendar/chat links and neglected-prospect notifications.
-- Review and apply only after confirming the target Supabase project and auth users.

create extension if not exists "pgcrypto";

create table if not exists public.crm_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create or replace function public.crm_is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.crm_workspace_members member
    where member.workspace_id = target_workspace_id
      and member.user_id = auth.uid()
  );
$$;

alter table public.prospects
  add column if not exists workspace_id uuid references public.crm_workspaces(id) on delete cascade,
  add column if not exists rfc text,
  add column if not exists postal_code text,
  add column if not exists country text default 'México',
  add column if not exists contact_role text,
  add column if not exists phone_extension text,
  add column if not exists status_raw text,
  add column if not exists completion_raw text,
  add column if not exists waiting_reason_code text,
  add column if not exists waiting_reason_detail text,
  add column if not exists follow_up_completed boolean not null default false,
  add column if not exists last_interaction_at timestamptz,
  add column if not exists next_action text,
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists normalized_name text,
  add column if not exists dedupe_key text,
  add column if not exists source_record_key text,
  add column if not exists raw_data jsonb not null default '{}'::jsonb;

create table if not exists public.crm_tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  name text not null,
  slug text not null,
  kind text not null default 'custom' check (kind in ('industry', 'waiting_reason', 'custom')),
  color text,
  created_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table if not exists public.prospect_tags (
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  tag_id uuid not null references public.crm_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prospect_id, tag_id)
);

create table if not exists public.prospect_contacts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  full_name text,
  role text,
  email text,
  phone text,
  phone_extension text,
  is_primary boolean not null default false,
  notes text,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prospect_locations (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  location_kind text not null default 'principal',
  label text,
  address_line text,
  city text,
  state text,
  postal_code text,
  country text default 'México',
  phone text,
  external_location_key text,
  source_file text,
  source_sheet text,
  source_row integer,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_import_batches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  source_file text not null,
  source_checksum text,
  status text not null default 'staged' check (status in ('staged', 'importing', 'completed', 'failed')),
  rows_read integer not null default 0,
  rows_created integer not null default 0,
  rows_linked integer not null default 0,
  rows_skipped integer not null default 0,
  error_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.prospects
  add column if not exists import_batch_id uuid references public.crm_import_batches(id) on delete set null;

create table if not exists public.crm_import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.crm_import_batches(id) on delete cascade,
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  source_file text not null,
  source_sheet text not null,
  source_row integer not null,
  record_key text not null,
  normalized_name text,
  dedupe_key text,
  prospect_id uuid references public.prospects(id) on delete set null,
  dedupe_status text not null default 'new' check (dedupe_status in ('new', 'linked', 'duplicate', 'skipped', 'needs_review')),
  raw_data jsonb not null default '{}'::jsonb,
  quality_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (batch_id, record_key)
);

alter table public.prospect_interactions
  add column if not exists workspace_id uuid references public.crm_workspaces(id) on delete cascade,
  add column if not exists contact_id uuid references public.prospect_contacts(id) on delete set null,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists due_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists external_provider text,
  add column if not exists external_id text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.crm_calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  prospect_id uuid references public.prospects(id) on delete set null,
  interaction_id uuid references public.prospect_interactions(id) on delete set null,
  provider text not null default 'microsoft',
  external_id text not null,
  subject text not null,
  contact_name text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  join_url text,
  sync_status text not null default 'synced' check (sync_status in ('pending', 'synced', 'cancelled', 'error')),
  raw_data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_id)
);

create table if not exists public.crm_microsoft_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id text,
  microsoft_user_id text,
  microsoft_email text,
  scopes text[] not null default '{}',
  refresh_token_ciphertext text,
  token_expires_at timestamptz,
  connected_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.crm_notification_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  inactivity_days integer not null default 14 check (inactivity_days between 1 and 365),
  notify_overdue boolean not null default true,
  notify_without_next_action boolean not null default true,
  target_chat_id text,
  send_hour smallint not null default 9 check (send_hour between 0 and 23),
  timezone text not null default 'America/Cancun',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.crm_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.crm_notification_rules(id) on delete cascade,
  delivery_key text not null,
  channel text not null default 'microsoft_chat',
  target text,
  prospect_ids uuid[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (rule_id, delivery_key)
);

create or replace function public.crm_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_workspaces_set_updated_at on public.crm_workspaces;
create trigger crm_workspaces_set_updated_at before update on public.crm_workspaces
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_prospects_set_updated_at on public.prospects;
create trigger crm_prospects_set_updated_at before update on public.prospects
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_contacts_set_updated_at on public.prospect_contacts;
create trigger crm_contacts_set_updated_at before update on public.prospect_contacts
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_locations_set_updated_at on public.prospect_locations;
create trigger crm_locations_set_updated_at before update on public.prospect_locations
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_calendar_events_set_updated_at on public.crm_calendar_events;
create trigger crm_calendar_events_set_updated_at before update on public.crm_calendar_events
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_connections_set_updated_at on public.crm_microsoft_connections;
create trigger crm_connections_set_updated_at before update on public.crm_microsoft_connections
for each row execute function public.crm_set_updated_at();

drop trigger if exists crm_notification_rules_set_updated_at on public.crm_notification_rules;
create trigger crm_notification_rules_set_updated_at before update on public.crm_notification_rules
for each row execute function public.crm_set_updated_at();

create index if not exists prospects_workspace_stage_priority_idx
  on public.prospects(workspace_id, stage, priority);
create index if not exists prospects_workspace_follow_up_idx
  on public.prospects(workspace_id, next_follow_up);
create index if not exists prospects_workspace_dedupe_idx
  on public.prospects(workspace_id, dedupe_key);
create index if not exists prospect_contacts_prospect_idx
  on public.prospect_contacts(prospect_id, is_primary desc);
create index if not exists prospect_locations_prospect_idx
  on public.prospect_locations(prospect_id);
create index if not exists import_rows_batch_idx
  on public.crm_import_rows(batch_id, dedupe_status);
create index if not exists calendar_events_workspace_date_idx
  on public.crm_calendar_events(workspace_id, starts_at);
create index if not exists notification_deliveries_status_idx
  on public.crm_notification_deliveries(rule_id, status);

alter table public.crm_workspaces enable row level security;
alter table public.crm_workspace_members enable row level security;
alter table public.prospects enable row level security;
alter table public.prospect_interactions enable row level security;
alter table public.crm_tags enable row level security;
alter table public.prospect_tags enable row level security;
alter table public.prospect_contacts enable row level security;
alter table public.prospect_locations enable row level security;
alter table public.crm_import_batches enable row level security;
alter table public.crm_import_rows enable row level security;
alter table public.crm_calendar_events enable row level security;
alter table public.crm_microsoft_connections enable row level security;
alter table public.crm_notification_rules enable row level security;
alter table public.crm_notification_deliveries enable row level security;

create policy crm_workspaces_member_select on public.crm_workspaces
  for select using (public.crm_is_workspace_member(id));
create policy crm_workspace_members_self_select on public.crm_workspace_members
  for select using (user_id = auth.uid() or public.crm_is_workspace_member(workspace_id));

create policy prospects_member_all on public.prospects
  for all using (public.crm_is_workspace_member(workspace_id))
  with check (public.crm_is_workspace_member(workspace_id));
create policy interactions_member_all on public.prospect_interactions
  for all using (public.crm_is_workspace_member(workspace_id))
  with check (public.crm_is_workspace_member(workspace_id));
create policy tags_member_all on public.crm_tags
  for all using (public.crm_is_workspace_member(workspace_id))
  with check (public.crm_is_workspace_member(workspace_id));
create policy prospect_tags_member_all on public.prospect_tags
  for all using (exists (select 1 from public.prospects p where p.id = prospect_id and public.crm_is_workspace_member(p.workspace_id)))
  with check (exists (select 1 from public.prospects p where p.id = prospect_id and public.crm_is_workspace_member(p.workspace_id)));
create policy contacts_member_all on public.prospect_contacts
  for all using (exists (select 1 from public.prospects p where p.id = prospect_id and public.crm_is_workspace_member(p.workspace_id)))
  with check (exists (select 1 from public.prospects p where p.id = prospect_id and public.crm_is_workspace_member(p.workspace_id)));
create policy locations_member_all on public.prospect_locations
  for all using (exists (select 1 from public.prospects p where p.id = prospect_id and public.crm_is_workspace_member(p.workspace_id)))
  with check (exists (select 1 from public.prospects p where p.id = prospect_id and public.crm_is_workspace_member(p.workspace_id)));
create policy import_batches_member_all on public.crm_import_batches
  for all using (public.crm_is_workspace_member(workspace_id))
  with check (public.crm_is_workspace_member(workspace_id));
create policy import_rows_member_all on public.crm_import_rows
  for all using (public.crm_is_workspace_member(workspace_id))
  with check (public.crm_is_workspace_member(workspace_id));
create policy calendar_events_member_all on public.crm_calendar_events
  for all using (public.crm_is_workspace_member(workspace_id))
  with check (public.crm_is_workspace_member(workspace_id));
create policy microsoft_connections_owner_all on public.crm_microsoft_connections
  for all using (user_id = auth.uid() and public.crm_is_workspace_member(workspace_id))
  with check (user_id = auth.uid() and public.crm_is_workspace_member(workspace_id));
create policy notification_rules_owner_all on public.crm_notification_rules
  for all using (user_id = auth.uid() and public.crm_is_workspace_member(workspace_id))
  with check (user_id = auth.uid() and public.crm_is_workspace_member(workspace_id));
create policy notification_deliveries_member_all on public.crm_notification_deliveries
  for all using (exists (select 1 from public.crm_notification_rules rule where rule.id = rule_id and public.crm_is_workspace_member(rule.workspace_id)))
  with check (exists (select 1 from public.crm_notification_rules rule where rule.id = rule_id and public.crm_is_workspace_member(rule.workspace_id)));

comment on table public.crm_import_rows is 'Immutable provenance and raw values for every workbook row; do not discard on dedupe.';
comment on table public.prospect_locations is 'Multiple plants/branches per prospect, including IMMEX plant rows.';
comment on table public.crm_microsoft_connections is 'refresh_token_ciphertext must be encrypted by the server before insertion; never store plaintext tokens.';
