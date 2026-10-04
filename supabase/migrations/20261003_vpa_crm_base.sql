-- VPA CRM: base de prospectos y seguimiento.
-- Se deja como migración local para revisión; no se aplica automáticamente.

create extension if not exists "pgcrypto";

create type public.prospect_stage as enum (
  'clientes recibidos',
  'clientes contactados',
  'clientes interesados',
  'clientes en espera',
  'clientes no interesados'
);

create type public.prospect_priority as enum ('alta', 'media', 'baja');

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  trade_name text,
  contact_name text,
  email text,
  phone text,
  website text,
  address text,
  city text,
  state text,
  industry text not null default 'Por clasificar',
  stage public.prospect_stage not null default 'clientes recibidos',
  priority public.prospect_priority not null default 'media',
  waiting_reason text,
  notes text,
  source_file text,
  source_sheet text,
  source_row integer,
  next_follow_up date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prospect_interactions (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('llamada', 'visita', 'reunión', 'correo', 'nota')),
  happened_at timestamptz not null default now(),
  summary text not null,
  next_step text,
  created_at timestamptz not null default now()
);

create index prospects_stage_priority_idx on public.prospects(stage, priority);
create index prospects_company_name_idx on public.prospects using gin (to_tsvector('simple', company_name));
create index interactions_prospect_happened_idx on public.prospect_interactions(prospect_id, happened_at desc);

alter table public.prospects enable row level security;
alter table public.prospect_interactions enable row level security;

-- Access policies are intentionally left for the first authenticated-user setup.
-- Do not expose this data publicly until the two-user auth policy is confirmed.
