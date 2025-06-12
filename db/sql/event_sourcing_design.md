# イベントソーシング設計ドキュメント

## 概要

Honokaアプリのpaymentsドメインにイベントソーシングパターンを導入します。これにより、支払いデータの変更履歴を完全に追跡し、監査証跡やタイムトラベルクエリが可能になります。

## テーブル設計

### 1. イベントストア (`payment_events` / `dev_payment_events`)

支払い関連の全てのイベントを時系列で保存するテーブルです。

```sql
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
```

#### フィールド説明

- `id`: シーケンシャルなプライマリキー
- `event_id`: 各イベントのユニークID（UUID）
- `aggregate_id`: 支払い集約のID（一つの支払いに関連する全イベントをグループ化）
- `event_type`: イベントタイプ（`PaymentCreated`, `PaymentUpdated`, `PaymentDeleted`）
- `event_data`: イベントの詳細データ（JSON形式）
- `event_metadata`: メタデータ（ユーザーID、IPアドレスなど）
- `version`: 集約内でのイベントバージョン（楽観的ロック用）
- `occurred_at`: イベント発生時刻
- `created_at`: レコード作成時刻

### 2. プロジェクション (`payment_projections` / `dev_payment_projections`)

読み取り最適化用の現在状態を保存するテーブルです。

```sql
create table payment_projections (
  id bigint not null primary key,
  aggregate_id uuid unique not null,
  monthly_invoice_id bigint references monthly_invoices (id),
  amount bigint not null,
  item text not null,
  memo text,
  owner_id uuid not null,
  status text not null default 'active',
  created_at timestamp with time zone not null,
  updated_at timestamp with time zone not null,
  last_event_version bigint not null
);
```

## イベントタイプと構造

### PaymentCreated

支払いが新規作成された時のイベント

```json
{
  "event_type": "PaymentCreated",
  "event_data": {
    "monthly_invoice_id": 123,
    "amount": 15000,
    "item": "食費",
    "memo": "スーパーでの買い物",
    "owner_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "event_metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T10:30:00Z",
    "source": "mobile_app"
  }
}
```

### PaymentUpdated

支払い情報が更新された時のイベント

```json
{
  "event_type": "PaymentUpdated",
  "event_data": {
    "changes": {
      "amount": {"from": 15000, "to": 18000},
      "item": {"from": "食費", "to": "食費（追加購入）"},
      "memo": {"from": "スーパーでの買い物", "to": "スーパーでの買い物＋コンビニ"}
    }
  },
  "event_metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T14:20:00Z",
    "source": "mobile_app"
  }
}
```

### PaymentDeleted

支払いが削除された時のイベント

```json
{
  "event_type": "PaymentDeleted",
  "event_data": {
    "reason": "user_request"
  },
  "event_metadata": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-15T16:45:00Z",
    "source": "mobile_app"
  }
}
```

## インデックス戦略

1. **aggregate_id + version**: 楽観的ロックとイベント順序保証
2. **event_type**: イベントタイプでの高速検索
3. **occurred_at**: 時系列でのイベント検索

## 利点

1. **完全な監査証跡**: 全ての変更が記録される
2. **タイムトラベルクエリ**: 過去の任意の時点での状態を再現可能
3. **イベントリプレイ**: 障害からの復旧やデバッグが容易
4. **読み取り最適化**: プロジェクションテーブルで高速クエリ
5. **拡張性**: 新しいイベントタイプの追加が容易

## 実装の考慮事項

1. **バージョン管理**: 楽観的ロックによる同時更新制御
2. **プロジェクション同期**: イベント保存後にプロジェクションを更新
3. **パフォーマンス**: 大量のイベントに対するアーカイブ戦略
4. **スキーマ進化**: event_dataのJSONスキーマの後方互換性
