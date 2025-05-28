- invoice テーブルにバグがあって、`is_paid` が `false` のままになっている過去の請求書を `true` に更新する必要がある
- そのための SQL クエリを作成する

```sql
UPDATE monthly_invoices
SET is_paid = true
WHERE is_paid = false
  AND id NOT IN (
    SELECT id
    FROM monthly_invoices
    ORDER BY id DESC
    LIMIT 1
  );
```

- 補足
    - `is_paid` が `false` のままになっている請求書のみを更新する
    - このクエリは、過去の請求書の支払いステータスを正しく更新するために使用される
    - 最新の請求書（最大のID）を除外して更新する
