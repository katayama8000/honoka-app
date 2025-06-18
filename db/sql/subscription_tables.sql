-- サブスク管理機能のテーブル設計（最小版）

-- ENUM型の定義
CREATE TYPE billing_cycle_type AS ENUM ('monthly', 'yearly');

-- カップルが利用しているサブスクリプション
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

-- DEV環境用テーブル
CREATE TYPE billing_cycle_type AS ENUM ('monthly', 'yearly');

CREATE TABLE dev_couple_subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  couple_id bigint REFERENCES dev_couples (id) NOT NULL,
  service_name text NOT NULL,
  monthly_amount bigint NOT NULL,
  billing_cycle billing_cycle_type NOT NULL,
  next_billing_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);


-- インデックスの作成
create index idx_couple_subscriptions_couple_id on couple_subscriptions (couple_id);
create index idx_couple_subscriptions_next_billing_date on couple_subscriptions (next_billing_date);

-- DEV環境用インデックス
create index idx_dev_couple_subscriptions_couple_id on dev_couple_subscriptions (couple_id);
create index idx_dev_couple_subscriptions_next_billing_date on dev_couple_subscriptions (next_billing_date);
