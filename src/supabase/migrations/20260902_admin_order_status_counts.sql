-- Pre-aggregates order counts by fulfillment_status server-side, so
-- AdminAnalytics.tsx's Orders tab can show real Completed/Pending/
-- Cancelled/Refunded counts instead of hardcoded '—' placeholders.
create or replace view public.admin_order_status_counts as
select fulfillment_status, count(*) as count
from public.orders
group by fulfillment_status;