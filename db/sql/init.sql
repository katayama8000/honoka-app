create table couples (
  id bigint not null primary key,
  user1_id text not null,
  user2_id text not null,
  created_at timestamp default now() not null
);

create table monthly_invoices (
  id bigint not null primary key,
  created_at timestamp default now() not null,
  couple_id bigint references couples (id),
  is_paid boolean not null,
  updated_at timestamp default now() not null,
  active boolean not null,
  month smallint not null,
  year smallint not null
);

create table payments (
  id bigint not null primary key,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null,
  monthly_invoice_id bigint references monthly_invoices (id),
  amount bigint not null,
  item text not null,
  owner_id uuid default uuid_generate_v4(),
  memo text
);

create table users (
  id bigint not null primary key,
  created_at timestamp default now() not null,
  user_id text not null,
  expo_push_token text not null,
  name text not null
);

create table dev_couples (
  id bigint not null primary key,
  user1_id text not null,
  user2_id text not null,
  created_at timestamp default now() not null
);

create table dev_monthly_invoices (
  id bigint not null primary key,
  created_at timestamp default now() not null,
  couple_id bigint references dev_couples (id),
  is_paid boolean not null,
  updated_at timestamp default now() not null,
  active boolean not null,
  year smallint not null,
  month smallint not null
);

create table dev_payments (
  id bigint not null primary key,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null,
  monthly_invoice_id bigint references dev_monthly_invoices (id),
  amount bigint not null,
  item text not null,
  owner_id uuid default uuid_generate_v4(),
  memo text
);

create table dev_users (
  id bigint not null primary key,
  created_at timestamp default now() not null,
  user_id text not null,
  expo_push_token text not null,
  name text not null
);

