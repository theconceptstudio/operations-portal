-- Operations Portal — schema Supabase (mirror da Notion)
-- Applicare sul progetto Supabase zswuuoosuzpqylnpsuae.
-- RLS abilitata senza policy pubbliche: l'accesso passa solo dal server (service_role) + token operatore.

create table if not exists public.op_operatori (
  notion_id text primary key,
  nome text,
  email text,
  token text unique,            -- link senza password: /o/<token>
  attivo boolean default true,
  updated_at timestamptz default now()
);

create table if not exists public.op_appartamenti (
  notion_id text primary key,
  nome text,
  indirizzo text,
  responsabile_notion_id text,  -- operatore responsabile pulizia
  calendar_id text,
  updated_at timestamptz default now()
);

create table if not exists public.op_pulizie (
  notion_id text primary key,
  appartamento_notion_id text,
  operatore_notion_id text,     -- derivato dal responsabile dell'appartamento
  data date,
  tipo text,
  stato text,
  prezzo numeric,
  inizio text,
  fine text,
  deposito text,
  late_checkout boolean default false,
  early_checkin boolean default false,
  updated_at timestamptz default now()
);

create table if not exists public.op_issues (
  notion_id text primary key,
  descrizione text,
  appartamento_notion_id text,
  operatore_notion_id text,
  priorita text,
  stato text,
  data_intervento date,
  confermato_manutentore boolean default false,
  confermato_il timestamptz,
  created_time timestamptz,
  updated_at timestamptz default now()
);

create index if not exists idx_op_pulizie_operatore on public.op_pulizie(operatore_notion_id);
create index if not exists idx_op_pulizie_appartamento on public.op_pulizie(appartamento_notion_id);
create index if not exists idx_op_issues_operatore on public.op_issues(operatore_notion_id);

alter table public.op_operatori enable row level security;
alter table public.op_appartamenti enable row level security;
alter table public.op_pulizie enable row level security;
alter table public.op_issues enable row level security;
