-- Networking Night · initial schema
-- All access goes through the server with the service role key; RLS is on with no
-- policies so the anon key can read or write nothing.

create extension if not exists pgcrypto;

-- 'miembro' always carries the chapter name in *_chapter
create type membership as enum ('miembro', 'invitado');
create type order_status as enum ('pending', 'paid', 'expired', 'canceled');
create type ticket_status as enum ('pending', 'valid', 'void');
create type scan_result as enum ('valid', 'duplicate', 'invalid', 'unpaid');

create table orders (
  id uuid primary key default gen_random_uuid(),
  -- secret for the buyer's "mis boletos" link
  access_token text not null unique,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  buyer_membership membership not null,
  buyer_chapter text,
  quantity int not null check (quantity between 1 and 10),
  unit_price_mxn int not null,
  total_mxn int not null,
  status order_status not null default 'pending',
  payment_method text,
  stripe_session_id text unique,
  stripe_payment_intent text,
  privacy_accepted_at timestamptz not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  position int not null,
  code text not null unique,
  -- bumps on every transfer so earlier QR codes stop working
  version int not null default 1,
  attendee_name text not null,
  attendee_email text,
  attendee_membership membership not null,
  attendee_chapter text,
  status ticket_status not null default 'pending',
  checked_in_at timestamptz,
  checked_in_by text,
  created_at timestamptz not null default now(),
  unique (order_id, position)
);

create table transfers (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  from_name text not null,
  to_name text not null,
  to_email text,
  created_at timestamptz not null default now()
);

create table scans (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete set null,
  raw text not null,
  result scan_result not null,
  scanned_by text not null,
  created_at timestamptz not null default now()
);

create table staff (
  email text primary key,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create table settings (
  key text primary key,
  value jsonb not null
);
insert into settings (key, value) values ('sales_open', 'true');

create index tickets_order_idx on tickets(order_id);
create index scans_ticket_idx on scans(ticket_id);
create index orders_status_idx on orders(status);

alter table orders enable row level security;
alter table tickets enable row level security;
alter table transfers enable row level security;
alter table scans enable row level security;
alter table staff enable row level security;
alter table settings enable row level security;

-- The site talks to these tables only with the secret (service_role) key. Newer Supabase
-- projects no longer grant table access by default, so grant it explicitly.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;

insert into staff (email, role) values ('hey@draftstudio.mx', 'admin');
