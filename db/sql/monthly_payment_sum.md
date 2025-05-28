## 月毎、ユーザーごとに払った金額を知りたい
- 期待出力
    - 2023/1
    - ユーザーID
        - 30,000 円
    - ユーザーID
        - 20,000 円 

- テーブル
    ````sql
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
    ````

- クエリ
    ```sql
    select
        concat(monthly_invoices.year, '/', monthly_invoices.month) as month,
        users.user_id,
        users.name as user_name,
        sum(payments.amount) as total_amount
    from
        monthly_invoices
        join payments on payments.monthly_invoice_id = monthly_invoices.id
        join couples on couples.id = monthly_invoices.couple_id
        join users on users.user_id = couples.user1_id or users.user_id = couples.user2_id
    where
        monthly_invoices.is_paid = true
        and payments.owner_id = users.user_id::uuid
    group by
        monthly_invoices.year,
        monthly_invoices.month,
        users.user_id,
        users.name
    order by
        monthly_invoices.year,
        monthly_invoices.month,
        users.user_id;
    ```
- 説明
    - `monthly_invoices` テーブルから、支払い済みの請求書を選択
    - `payments` テーブルと結合して、各請求書に対する支払いを取得
    - `couples` テーブルと結合して、カップル情報を取得
    - `users` テーブルと結合して、支払いを行ったユーザーを特定
    - UUIDフォーマットの`payments.owner_id`とテキストフォーマットの`users.user_id`を適切に比較
    - 月ごとにグループ化し、ユーザーごとの合計支払い金額を計算
    - ユーザー名も表示して、どのユーザーが支払いを行ったかを分かりやすく表示
- 注意点
    - `couples` テーブルの `user1_id` と `user2_id` を使って、ユーザーを特定
    - ユーザーが複数の請求書に支払いを行った場合、合計金額が正しく集計されることを確認
    - `expo_push_token` や `name` はこのクエリでは使用しないが、必要に応じて追加可能

- 各結合段階でのデータ構造:

    1. `monthly_invoices` テーブル (開始点):

    | id | couple_id | is_paid | month | year | active | created_at | updated_at |
    |----|-----------|---------|-------|------|--------|------------|------------|
    | 1  | 100       | true    | 1     | 2023 | true   | 2023-01-01 | 2023-01-31 |
    | 2  | 100       | true    | 2     | 2023 | true   | 2023-02-01 | 2023-02-28 |

    2. `monthly_invoices` + `payments` 結合後:
    
    | monthly_invoice_id | couple_id | month | year | payment_id | amount | item     | owner_id                              |
    |-------------------|-----------|-------|------|------------|--------|----------|---------------------------------------|
    | 1                 | 100       | 1     | 2023 | 101        | 10000  | 食費      | 550e8400-e29b-41d4-a716-446655440000 |
    | 1                 | 100       | 1     | 2023 | 102        | 20000  | 家賃      | 550e8400-e29b-41d4-a716-446655440000 |
    | 2                 | 100       | 2     | 2023 | 201        | 15000  | 光熱費    | 6ba7b810-9dad-11d1-80b4-00c04fd430c8 |

    3. `monthly_invoices` + `payments` + `couples` 結合後:

    | invoice_id | month | year | payment_id | amount | couple_id | user1_id | user2_id                         |
    |------------|-------|------|------------|--------|-----------|----------|----------------------------------|
    | 1          | 1     | 2023 | 101        | 10000  | 100       | user_A   | user_B                           |
    | 1          | 1     | 2023 | 102        | 20000  | 100       | user_A   | user_B                           |
    | 2          | 2     | 2023 | 201        | 15000  | 100       | user_A   | user_B                           |

    4. 全テーブル結合後 (`users` との結合を含む):

    | invoice_id | month | year | payment_id | amount | couple_id | user_id | name   | owner_id                              |
    |------------|-------|------|------------|--------|-----------|---------|--------|---------------------------------------|
    | 1          | 1     | 2023 | 101        | 10000  | 100       | user_A  | 太郎    | 550e8400-e29b-41d4-a716-446655440000 |
    | 1          | 1     | 2023 | 102        | 20000  | 100       | user_A  | 太郎    | 550e8400-e29b-41d4-a716-446655440000 |
    | 2          | 2     | 2023 | 201        | 15000  | 100       | user_B  | 花子    | 6ba7b810-9dad-11d1-80b4-00c04fd430c8 |

    5. フィルタリング後 (`where` 句適用後):

    | invoice_id | month | year | payment_id | amount | user_id | name   | owner_id                              |
    |------------|-------|------|------------|--------|---------|--------|---------------------------------------|
    | 1          | 1     | 2023 | 101        | 10000  | user_A  | 太郎    | 550e8400-e29b-41d4-a716-446655440000 |
    | 1          | 1     | 2023 | 102        | 20000  | user_A  | 太郎    | 550e8400-e29b-41d4-a716-446655440000 |
    | 2          | 2     | 2023 | 201        | 15000  | user_B  | 花子    | 6ba7b810-9dad-11d1-80b4-00c04fd430c8 |

    6. グループ化と集計後 (最終結果):

    | month   | user_id | user_name | total_amount |
    |---------|---------|-----------|--------------|
    | 2023/1  | user_A  | 太郎       | 30000        |
    | 2023/2  | user_B  | 花子       | 15000        |

