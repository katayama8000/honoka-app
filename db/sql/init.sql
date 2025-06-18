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

-- サブスクリプション管理機能

-- ENUM型の定義
create type billing_cycle_type as enum ('monthly', 'yearly');

-- 本番環境用サブスクリプションテーブル
create table couple_subscriptions (
  id bigint not null primary key,
  created_at timestamp default now() not null,
  couple_id bigint references couples (id) not null,
  service_name text not null, -- サービス名（自由入力）
  monthly_amount bigint not null, -- 月額料金（円）
  billing_cycle billing_cycle_type not null, -- 請求サイクル
  next_billing_date date not null, -- 次回請求日
  is_active boolean not null default true -- アクティブかどうか
);

-- DEV環境用サブスクリプションテーブル
create table dev_couple_subscriptions (
  id bigint not null primary key,
  created_at timestamp default now() not null,
  couple_id bigint references dev_couples (id) not null,
  service_name text not null, -- サービス名（自由入力）
  monthly_amount bigint not null, -- 月額料金（円）
  billing_cycle billing_cycle_type not null, -- 請求サイクル
  next_billing_date date not null, -- 次回請求日
  is_active boolean not null default true -- アクティブかどうか
);

-- インデックスの作成
create index idx_couple_subscriptions_couple_id on couple_subscriptions (couple_id);
create index idx_couple_subscriptions_next_billing_date on couple_subscriptions (next_billing_date);

-- DEV環境用インデックス
create index idx_dev_couple_subscriptions_couple_id on dev_couple_subscriptions (couple_id);
create index idx_dev_couple_subscriptions_next_billing_date on dev_couple_subscriptions (next_billing_date);

