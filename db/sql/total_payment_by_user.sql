SELECT
  owner_id,
  SUM(amount) AS total_amount
FROM payments
WHERE deleted_at IS NULL
GROUP BY
  owner_id;
