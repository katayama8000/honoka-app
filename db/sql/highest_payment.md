- 全期間の中で最も高額な支払いを取得するクエリ

```sql
select
    payments.id,
    payments.created_at,
    payments.amount,
    payments.item,
    users.user_id,
    users.name as user_name
from
    payments
    join users on payments.owner_id::text = users.user_id
where
    payments.amount = (
        select max(amount)
        from payments
    )
order by
    payments.created_at desc
limit 1;
```

- 各結合段階でのデータ構造:

    1. `payments` テーブル (開始点):

    | id | created_at           | amount | item     | owner_id                              | monthly_invoice_id |
    |----|----------------------|--------|----------|---------------------------------------|-------------------|
    | 101| 2023-01-15 10:30:00  | 10000  | 食費      | 550e8400-e29b-41d4-a716-446655440000 | 1                 |
    | 102| 2023-01-20 14:45:00  | 45000  | 家電      | 550e8400-e29b-41d4-a716-446655440000 | 1                 |
    | 201| 2023-02-10 09:15:00  | 15000  | 光熱費    | 6ba7b810-9dad-11d1-80b4-00c04fd430c8 | 2                 |

    2. サブクエリ適用後 (最大の `amount` を選択):

    | max(amount) |
    |-------------|
    | 45000       |

    3. `payments` + `users` 結合後:

    | id | created_at           | amount | item     | owner_id                              | user_id | name   |
    |----|----------------------|--------|----------|---------------------------------------|---------|--------|
    | 101| 2023-01-15 10:30:00  | 10000  | 食費      | 550e8400-e29b-41d4-a716-446655440000 | user_A  | 太郎    |
    | 102| 2023-01-20 14:45:00  | 45000  | 家電      | 550e8400-e29b-41d4-a716-446655440000 | user_A  | 太郎    |
    | 201| 2023-02-10 09:15:00  | 15000  | 光熱費    | 6ba7b810-9dad-11d1-80b4-00c04fd430c8 | user_B  | 花子    |

    4. フィルタリング後 (`where` 句適用後):

    | id | created_at           | amount | item     | user_id | name   |
    |----|----------------------|--------|----------|---------|--------|
    | 102| 2023-01-20 14:45:00  | 45000  | 家電      | user_A  | 太郎    |

    5. 並べ替えとリミット適用後 (最終結果):

    | id | created_at           | amount | item     | user_id | name   |
    |----|----------------------|--------|----------|---------|--------|
    | 102| 2023-01-20 14:45:00  | 45000  | 家電      | user_A  | 太郎    |
