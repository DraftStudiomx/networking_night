-- Networking Night · whether each order's ticket email went out
-- 'sent' = delivered to Resend · 'failed' = rejected (retried daily) · 'skipped' = manual
-- order created without email · null on a paid order = not attempted yet (also retried)

alter table orders
  add column email_status text check (email_status in ('sent', 'failed', 'skipped')),
  add column email_error text,
  add column email_at timestamptz;

-- orders paid before this change already have their email
update orders set email_status = 'sent', email_at = coalesce(paid_at, now()) where status = 'paid';
