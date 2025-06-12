-- Event Sourcing Tables for Payments Domain

-- 支払い関連のイベントストア
create table payment_events (
  id bigint not null primary key,
  event_id uuid default gen_random_uuid() unique not null,
  aggregate_id uuid not null, -- payment aggregate ID
  event_type text not null,
  event_data jsonb not null,
  event_metadata jsonb,
  version bigint not null,
  occurred_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

-- aggregate_id と version の組み合わせにユニーク制約
create unique index payment_events_aggregate_version_idx 
on payment_events (aggregate_id, version);

-- イベントタイプでのインデックス
create index payment_events_event_type_idx 
on payment_events (event_type);

-- 時間順でのインデックス
create index payment_events_occurred_at_idx 
on payment_events (occurred_at);

-- 支払い集約の現在状態（読み取り最適化用）
create table payment_projections (
  id bigint not null primary key,
  aggregate_id uuid unique not null,
  monthly_invoice_id bigint references monthly_invoices (id),
  amount bigint not null,
  item text not null,
  memo text,
  owner_id uuid not null,
  status text not null default 'active', -- active, deleted
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  last_event_version bigint not null
);

-- 開発環境用テーブル
create table dev_payment_events (
  id bigint not null primary key,
  event_id uuid default gen_random_uuid() unique not null,
  aggregate_id uuid not null,
  event_type text not null,
  event_data jsonb not null,
  event_metadata jsonb,
  version bigint not null,
  occurred_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

create unique index dev_payment_events_aggregate_version_idx 
on dev_payment_events (aggregate_id, version);

create index dev_payment_events_event_type_idx 
on dev_payment_events (event_type);

create index dev_payment_events_occurred_at_idx 
on dev_payment_events (occurred_at);

create table dev_payment_projections (
  id bigint not null primary key,
  aggregate_id uuid unique not null,
  monthly_invoice_id bigint references dev_monthly_invoices (id),
  amount bigint not null,
  item text not null,
  memo text,
  owner_id uuid not null,
  status text not null default 'active',
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  last_event_version bigint not null
);

-- イベントタイプの定数（制約として使用可能）
-- ALTER TABLE payment_events ADD CONSTRAINT valid_event_types 
-- CHECK (event_type IN ('PaymentCreated', 'PaymentUpdated', 'PaymentDeleted'));

-- ALTER TABLE dev_payment_events ADD CONSTRAINT dev_valid_event_types 
-- CHECK (event_type IN ('PaymentCreated', 'PaymentUpdated', 'PaymentDeleted'));
