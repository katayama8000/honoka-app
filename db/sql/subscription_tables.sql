-- 本番環境用テーブル
CREATE TABLE couple_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  monthly_amount decimal(10,2) NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly')),
  next_billing_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- DEV環境用テーブル  
CREATE TABLE dev_couple_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES dev_couples(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  monthly_amount decimal(10,2) NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly')),
  next_billing_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- インデックス
CREATE INDEX idx_couple_subscriptions_couple_id ON couple_subscriptions(couple_id);
CREATE INDEX idx_couple_subscriptions_next_billing ON couple_subscriptions(next_billing_date);
CREATE INDEX idx_couple_subscriptions_active ON couple_subscriptions(is_active);

CREATE INDEX idx_dev_couple_subscriptions_couple_id ON dev_couple_subscriptions(couple_id);
CREATE INDEX idx_dev_couple_subscriptions_next_billing ON dev_couple_subscriptions(next_billing_date);
CREATE INDEX idx_dev_couple_subscriptions_active ON dev_couple_subscriptions(is_active);
