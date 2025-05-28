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


