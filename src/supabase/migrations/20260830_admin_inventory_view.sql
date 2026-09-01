-- Pre-aggregates products + product_inventory server-side so
-- getAdminInventory() stops doing two round trips and a JS-side
-- Map/group-by for every admin panel load.
create or replace view public.admin_inventory_view as
select
  p.id as product_id,
  p.name,
  'NY2-' || upper(substring(p.id::text from 1 for 8)) as sku,
  coalesce(sum(pi.available), 0) as total_available,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'size', pi.size,
        'available', pi.available,
        'reserved', pi.reserved,
        'sold', pi.sold
      ) order by pi.size
    ) filter (where pi.id is not null),
    '[]'::jsonb
  ) as sizes,
  case
    when coalesce(sum(pi.available), 0) = 0 then 'Out of Stock'
    when coalesce(sum(pi.available), 0) < 5 then 'Low Stock'
    else 'In Stock'
  end as status
from public.products p
left join public.product_inventory pi on pi.product_id = p.id
group by p.id, p.name
order by p.name;


-- Pre-aggregates order counts by fulfillment_status server-side, so
-- AdminAnalytics.tsx's Orders tab can show real Completed/Pending/
-- Cancelled/Refunded counts instead of hardcoded '—' placeholders.
create or replace view public.admin_order_status_counts as
select fulfillment_status, count(*) as count
from public.orders
group by fulfillment_status;

-- Refunded orders live on payment_status, not fulfillment_status —
-- a separate small aggregate view for that dimension.
create or replace view public.admin_payment_status_counts as
select payment_status, count(*) as count
from public.orders
group by payment_status;