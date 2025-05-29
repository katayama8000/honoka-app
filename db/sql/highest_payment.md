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
