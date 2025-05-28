    select
        concat(monthly_invoices.year, '/', monthly_invoices.month) as month,
        users.user_id,
        sum(payments.amount) as total_amount
    from
        monthly_invoices
        join payments on payments.monthly_invoice_id = monthly_invoices.id
        join couples on couples.id = monthly_invoices.couple_id
        join users on users.user_id = couples.user1_id or users.user_id = couples.user2_id
    where
        monthly_invoices.is_paid = true
    group by
        monthly_invoices.year,
        monthly_invoices.month,
        users.user_id
    order by
        monthly_invoices.year,
        monthly_invoices.month,
        users.user_id;
