UPDATE monthly_invoices
SET is_paid = true
WHERE is_paid = false
  AND id NOT IN (
    SELECT id
    FROM monthly_invoices
    ORDER BY id DESC
    LIMIT 1
  );
