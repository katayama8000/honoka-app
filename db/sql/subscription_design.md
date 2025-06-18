# サブスクリプション管理機能 テーブル設計

## 概要
Honokaアプリにサブスクリプション管理機能を追加するためのテーブル設計です。PostgreSQLのENUM型を活用したシンプルで型安全な構造です。

## PostgreSQL ENUM型

### billing_cycle_type
```sql
CREATE TYPE billing_cycle_type AS ENUM ('monthly', 'yearly');
```
- 型安全性の向上
- 無効な値の挿入を防止
- ストレージ効率の最適化

## テーブル構成

### couple_subscriptions
カップルが利用しているサブスクリプション

**カラム:**
- `id`: 主キー (bigint)
- `created_at`: 作成日時 (timestamp)
- `couple_id`: カップルID (couplesテーブルへの外部キー)
- `service_name`: サービス名（自由入力）
- `monthly_amount`: 月額料金 (bigint、円単位)
- `billing_cycle`: 請求サイクル (billing_cycle_type ENUM)
- `next_billing_date`: 次回請求日
- `is_active`: アクティブ状態

## データ型の特徴

### ENUM型の採用
- `billing_cycle_type` でサイクルを型安全に管理
- 'monthly' と 'yearly' の2値のみ許可
- CHECK制約より効率的で安全

### bigint型の採用
- `monthly_amount` は `bigint` 型（円単位）
- 整数演算で精度の問題を回避
- 大きな金額にも対応

### CASCADE削除
- カップルが削除されたらサブスクも自動削除
- データ整合性を保証

## 主な機能

### 1. サブスク登録・管理
- 新しいサブスクリプションの追加（サービス名は自由入力）
- 既存サブスクの編集・削除
- アクティブ/非アクティブの切り替え

### 2. 請求管理
- 次回請求日の管理
- 月額料金の記録
- 請求サイクルの設定（月次/年次/週次）

## インデックス設計

### 検索最適化
- `couple_id`: カップル別のサブスク一覧表示
- `next_billing_date`: 請求日による検索・ソート
- `is_active`: アクティブなサブスクのフィルタリング

## 開発環境対応
- 本番環境: `couple_subscriptions`
- DEV環境: `dev_couple_subscriptions`
- 同じ構造で環境分離

## 設計思想

### シンプルさ重視
- 必要最小限のカラムのみ
- 1つのテーブルで完結
- 複雑な請求履歴や通知機能は除外

### 拡張性
- 後から必要に応じてカラム追加可能
- 他テーブルとの連携も簡単
