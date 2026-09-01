-- ============================================================================
--  NOTORIOUS.Y2 — PHASE 0 FIXES
--  Supersedes nothing — purely additive on top of:
--    20260822141356_notorious_y2_schema_v2.sql
--    20260826_banners_and_inventory_triggers.sql
--
--  This migration fixes:
--   1. category_sizes table + get_category_sizes() — single source of truth
--      for which sizes are valid per product category (was hardcoded and
--      INCONSISTENT in three different frontend files, causing the
--      "stock always saves as 0" bug).
--   2. create_product_with_inventory() RPC — atomic create (product row +
--      inventory rows) in a single round trip, single transaction.
--   3. update_product_with_inventory() RPC — same, for updates.
--   4-6. revenue_by_category / revenue_by_country / revenue_by_payment
--      views — move GROUP BY aggregation into Postgres instead of shipping
--      every order/order_item row to the client and reducing in JS.
--      NOTE: revenue_by_payment is sourced from payment_transactions.method,
--      NOT orders.payment_method — that column does not exist on `orders`.
--      The current data/admin.ts getAdminRevenueByPayment() queries a
--      nonexistent column and is silently broken; the new view fixes that
--      at the source.
--   7-8. hero + featured product selection — stored as new/extended
--      store_settings keys (hero_section.product_ids, featured_products,
--      plus nav_items and footer_settings while we're at it) rather than
--      new tables, since these are singular sections, not repeatable rows
--      like banners.
--   9. analytics_events(created_at) index — the traffic dashboard queries
--      by date range across all event types; the existing index leads
--      with event_type, which doesn't serve that access pattern well.
--   10. analytics_daily_traffic view — pre-aggregates day + event_type +
--      device + source + country server-side, so AdminAnalytics.tsx can
--      stop pulling every raw analytics_events row to the browser.
-- ============================================================================


-- ============================================================================
-- 1. CANONICAL SIZE TAXONOMY
-- ============================================================================

create table if not exists public.category_sizes (
  category    product_category not null,
  size        text not null,
  sort_order  integer not null default 0,
  primary key (category, size)
);

-- Seed the canonical sizes. This is now the ONLY place size labels per
-- category are defined — data/admin.ts's CATEGORY_SIZES constant and
-- AdminProducts.tsx's AVAILABLE_SIZES constant should both be deleted in
-- favor of reading from here (via get_category_sizes() or a direct select).
insert into public.category_sizes (category, size, sort_order) values
  ('top',       'SMALL',    1),
  ('top',       'MEDIUM',   2),
  ('top',       'LARGE',    3),
  ('bottom',    '28',       1),
  ('bottom',    '30',       2),
  ('bottom',    '32',       3),
  ('bottom',    '34',       4),
  ('bottom',    '36',       5),
  ('accessory', 'ONE SIZE', 1)
on conflict (category, size) do update set sort_order = excluded.sort_order;

alter table public.category_sizes enable row level security;

drop policy if exists "category_sizes_public_read" on public.category_sizes;
create policy "category_sizes_public_read" on public.category_sizes
  for select using (true);

drop policy if exists "category_sizes_admin_write" on public.category_sizes;
create policy "category_sizes_admin_write" on public.category_sizes
  for all using (public.is_admin()) with check (public.is_admin());

-- Convenience RPC so the frontend can fetch valid sizes for a category
-- directly (ordered), instead of hand-rolling a select + orderBy.
create or replace function public.get_category_sizes(p_category public.product_category)
returns table(size text, sort_order integer)
language sql
stable
set search_path = public
as $$
  select cs.size, cs.sort_order
  from public.category_sizes cs
  where cs.category = p_category
  order by cs.sort_order;
$$;

grant execute on function public.get_category_sizes(public.product_category) to anon, authenticated;


-- ============================================================================
-- 2 & 3. ATOMIC PRODUCT + INVENTORY RPCs
--
-- Both do the insert/update, the per-size inventory upsert, AND the
-- stale-size cleanup in ONE transaction, then return the finished product
-- row (with its resolved `sizes` array) in a single response — replacing
-- the current 5-7 sequential round trips in data/admin.ts's
-- createAdminProduct()/updateAdminProduct()/syncProductInventory().
--
-- products.stock and sold_out are still derived automatically by the
-- EXISTING trg_inventory_recalc trigger on product_inventory — these RPCs
-- never write to products.stock directly, same rule as before.
-- ============================================================================

create or replace function public.create_product_with_inventory(
  p_slug                  text,
  p_name                  text,
  p_price                 numeric,
  p_image                 text,
  p_images                text[],
  p_category              public.product_category,
  p_status                public.product_status,
  p_sold_out              boolean,
  p_position_top          text,
  p_position_left         text,
  p_mobile_position_top   text,
  p_mobile_position_left  text,
  p_rotation              numeric,
  p_scale                 numeric,
  p_z_index               integer,
  p_description           text,
  p_features              text[],
  p_size_stocks           jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id  uuid;
  v_valid_sizes text[];
  v_result      jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only admins can create products';
  end if;

  insert into public.products (
    slug, name, price, image, images, category, status, sold_out,
    position_top, position_left, mobile_position_top, mobile_position_left,
    rotation, scale, z_index, description, features
  ) values (
    p_slug, p_name, p_price, p_image, coalesce(p_images, '{}'), p_category, p_status, coalesce(p_sold_out, false),
    coalesce(p_position_top, '0px'), coalesce(p_position_left, '0%'), p_mobile_position_top, p_mobile_position_left,
    coalesce(p_rotation, 0), coalesce(p_scale, 1), coalesce(p_z_index, 1), p_description, coalesce(p_features, '{}')
  )
  returning id into v_product_id;

  select array_agg(size) into v_valid_sizes
  from public.category_sizes
  where category = p_category;

  -- Upsert one row per valid size, defaulting missing keys to 0 (an
  -- explicit 0-available row correctly says "carried, currently out of
  -- stock" rather than silently omitting the size).
  insert into public.product_inventory (product_id, size, available)
  select v_product_id, cs.size, greatest(0, coalesce((p_size_stocks ->> cs.size)::int, 0))
  from public.category_sizes cs
  where cs.category = p_category
  on conflict (product_id, size) do update set available = excluded.available;

  -- Safety net: remove any rows for sizes that aren't valid for this
  -- category (a no-op on a brand new product, but keeps this function
  -- identical in shape to the update version).
  delete from public.product_inventory
  where product_id = v_product_id
    and size <> all (coalesce(v_valid_sizes, array[]::text[]));

  select to_jsonb(p.*) || jsonb_build_object(
    'sizes', coalesce(
      (select jsonb_agg(jsonb_build_object(
                'size', pi.size,
                'available', pi.available,
                'reserved', pi.reserved,
                'sold', pi.sold
              ) order by pi.size)
       from public.product_inventory pi
       where pi.product_id = p.id),
      '[]'::jsonb
    )
  )
  into v_result
  from public.products p
  where p.id = v_product_id;

  return v_result;
end;
$$;

revoke all on function public.create_product_with_inventory(
  text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb
) from public;

grant execute on function public.create_product_with_inventory(
  text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb
) to authenticated;


create or replace function public.update_product_with_inventory(
  p_id                    uuid,
  p_slug                  text,
  p_name                  text,
  p_price                 numeric,
  p_image                 text,
  p_images                text[],
  p_category              public.product_category,
  p_status                public.product_status,
  p_sold_out              boolean,
  p_position_top          text,
  p_position_left         text,
  p_mobile_position_top   text,
  p_mobile_position_left  text,
  p_rotation              numeric,
  p_scale                 numeric,
  p_z_index               integer,
  p_description           text,
  p_features              text[],
  -- NULL means "leave inventory alone" (e.g. Floor Manager repositioning a
  -- product shouldn't wipe out its stock) — same contract as the current
  -- updateAdminProduct()'s "only touch inventory when sizeStocks supplied".
  p_size_stocks           jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_valid_sizes text[];
  v_result      jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only admins can update products';
  end if;

  update public.products set
    slug                  = coalesce(p_slug, slug),
    name                  = p_name,
    price                 = p_price,
    image                 = p_image,
    images                = coalesce(p_images, images),
    category              = p_category,
    status                = p_status,
    sold_out              = coalesce(p_sold_out, sold_out),
    position_top          = coalesce(p_position_top, position_top),
    position_left         = coalesce(p_position_left, position_left),
    mobile_position_top   = p_mobile_position_top,
    mobile_position_left  = p_mobile_position_left,
    rotation              = coalesce(p_rotation, rotation),
    scale                 = coalesce(p_scale, scale),
    z_index                = coalesce(p_z_index, z_index),
    description           = p_description,
    features              = coalesce(p_features, features)
  where id = p_id;

  if not found then
    raise exception 'Product % not found', p_id;
  end if;

  if p_size_stocks is not null then
    select array_agg(size) into v_valid_sizes
    from public.category_sizes
    where category = p_category;

    insert into public.product_inventory (product_id, size, available)
    select p_id, cs.size, greatest(0, coalesce((p_size_stocks ->> cs.size)::int, 0))
    from public.category_sizes cs
    where cs.category = p_category
    on conflict (product_id, size) do update set available = excluded.available;

    -- Handles category changes too (e.g. top -> accessory): sizes valid
    -- under the OLD category but not the new one get removed.
    delete from public.product_inventory
    where product_id = p_id
      and size <> all (coalesce(v_valid_sizes, array[]::text[]));
  end if;

  select to_jsonb(p.*) || jsonb_build_object(
    'sizes', coalesce(
      (select jsonb_agg(jsonb_build_object(
                'size', pi.size,
                'available', pi.available,
                'reserved', pi.reserved,
                'sold', pi.sold
              ) order by pi.size)
       from public.product_inventory pi
       where pi.product_id = p.id),
      '[]'::jsonb
    )
  )
  into v_result
  from public.products p
  where p.id = p_id;

  return v_result;
end;
$$;

revoke all on function public.update_product_with_inventory(
  uuid, text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb
) from public;

grant execute on function public.update_product_with_inventory(
  uuid, text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb
) to authenticated;


-- ============================================================================
-- 4-6. REVENUE AGGREGATION VIEWS
--
-- Replace data/admin.ts's getAdminRevenueByCategory/ByCountry/ByPayment,
-- which currently pull every paid order (+ nested order_items + nested
-- products) to the browser and reduce them into totals with a JS Map.
-- Percentage-of-total is computed in SQL via a window function so the
-- frontend can just render the rows as-is.
-- ============================================================================

create or replace view public.revenue_by_category as
select
  category,
  revenue,
  case when total_revenue > 0
    then round((revenue / total_revenue) * 100, 1)
    else 0
  end as percentage
from (
  select
    coalesce(p.category::text, 'Other') as category,
    sum(oi.quantity * oi.unit_price) as revenue,
    sum(sum(oi.quantity * oi.unit_price)) over () as total_revenue
  from public.orders o
  join public.order_items oi on oi.order_id = o.id
  left join public.products p on p.id = oi.product_id
  where o.payment_status = 'Paid'
  group by coalesce(p.category::text, 'Other')
) t
order by revenue desc;

create or replace view public.revenue_by_country as
select
  country,
  revenue,
  case when total_revenue > 0
    then round((revenue / total_revenue) * 100, 1)
    else 0
  end as percentage
from (
  select
    coalesce(nullif(o.shipping_address ->> 'country', ''), 'Unknown') as country,
    sum(o.total) as revenue,
    sum(sum(o.total)) over () as total_revenue
  from public.orders o
  where o.payment_status = 'Paid'
  group by coalesce(nullif(o.shipping_address ->> 'country', ''), 'Unknown')
) t
order by revenue desc;

-- IMPORTANT: sourced from payment_transactions.method, which is a REAL
-- column. The current getAdminRevenueByPayment() in data/admin.ts selects
-- `orders.payment_method`, which does not exist anywhere in the schema —
-- that query is silently broken today. This view is the actual fix, not
-- just a performance change.
create or replace view public.revenue_by_payment as
select
  method,
  revenue,
  case when total_revenue > 0
    then round((revenue / total_revenue) * 100, 1)
    else 0
  end as percentage
from (
  select
    coalesce(nullif(pt.method, ''), 'Unknown') as method,
    sum(pt.amount) as revenue,
    sum(sum(pt.amount)) over () as total_revenue
  from public.payment_transactions pt
  where pt.type = 'Sale' and pt.status = 'Completed'
  group by coalesce(nullif(pt.method, ''), 'Unknown')
) t
order by revenue desc;


-- ============================================================================
-- 7 & 8. HERO LINKED PRODUCTS + FEATURED PRODUCTS
--
-- Both hero and featured-products are SINGULAR storefront sections (there's
-- only ever one hero, one featured strip) — not repeatable rows like
-- banners — so these live as extra keys/fields inside store_settings
-- rather than new join tables. This also unblocks Store Navigation and
-- Store Footer, which AdminContent.tsx already has UI for but nothing to
-- save to.
-- ============================================================================

-- Add product_ids to the existing hero_section value if it's not already
-- there (idempotent — safe to re-run).
update public.store_settings
set value = value || '{"product_ids": []}'::jsonb
where key = 'hero_section'
  and not (value ? 'product_ids');

insert into public.store_settings (key, value) values
  ('featured_products', '{"product_ids": []}'),
  ('nav_items', '[
    {"label": "Shop", "link": "/"},
    {"label": "About", "link": "/about"},
    {"label": "Contact", "link": "/contact"}
  ]'),
  ('footer_settings', '{
    "email": "support@notorious.y2.com",
    "phone": "+27 63 503 5882",
    "copyright": "© 2025 NOTORIOUS.Y2",
    "social": {
      "instagram": "https://instagram.com/notori.y2",
      "tiktok": "https://tiktok.com/@notori.y2",
      "facebook": "https://facebook.com/notori.y2",
      "youtube": "https://youtube.com/@notori.Y2"
    }
  }')
on conflict (key) do nothing;


-- ============================================================================
-- 9. ANALYTICS_EVENTS INDEX FIX
--
-- The traffic dashboard's dominant query pattern is "give me everything in
-- this date range" (see getTrafficAnalyticsRaw in AdminAnalytics.tsx),
-- filtered by created_at first, event_type second (or not at all). The
-- existing idx_analytics_events_type_time index leads with event_type,
-- which doesn't serve that pattern well. Add a created_at-leading index
-- alongside it rather than replacing it, since some call sites do still
-- filter type-first.
-- ============================================================================

create index if not exists idx_analytics_events_created_at
  on public.analytics_events (created_at desc);


-- ============================================================================
-- 10. PRE-AGGREGATED TRAFFIC VIEW (day + event_type + device + source + country)
--
-- analytics_daily_summary (from the previous migration) only aggregates by
-- day + event_type. AdminAnalytics.tsx's traffic tab also needs device,
-- source (normalized from referrer), and country breakdowns — currently
-- computed client-side after pulling every raw analytics_events row for
-- the period. These two helper functions + the view below move that
-- normalization and aggregation into Postgres.
--
-- NOTE: this is a plain view (recomputed on every query), not a
-- materialized view. That's the right tradeoff for now, matching the
-- rest of this schema. If analytics_events grows into the millions of
-- rows, consider converting this to a materialized view refreshed on a
-- schedule (pg_cron) — flagged here as a known follow-up, not done in
-- this migration.
-- ============================================================================

create or replace function public.normalize_traffic_device(p_device text)
returns text
language sql
immutable
as $$
  select case
    when p_device is null then 'desktop'
    when lower(p_device) like '%mobile%' then 'mobile'
    when lower(p_device) like '%tablet%' then 'tablet'
    else 'desktop'
  end;
$$;

create or replace function public.normalize_traffic_source(p_referrer text)
returns text
language plpgsql
immutable
as $$
declare
  v_host text;
begin
  if p_referrer is null or p_referrer = '' then
    return 'Direct';
  end if;

  begin
    v_host := lower(regexp_replace(split_part(split_part(p_referrer, '://', 2), '/', 1), '^www\.', ''));
  exception when others then
    return p_referrer;
  end;

  if v_host is null or v_host = '' then
    return p_referrer;
  end if;

  if v_host like '%instagram%' then return 'Instagram'; end if;
  if v_host like '%facebook%' then return 'Facebook'; end if;
  if v_host like '%tiktok%' then return 'TikTok'; end if;
  if v_host like '%google%' then return 'Google'; end if;
  if v_host like '%youtube%' then return 'YouTube'; end if;
  if v_host like '%twitter%' or v_host like '%x.com%' then return 'X / Twitter'; end if;

  return v_host;
end;
$$;

create or replace view public.analytics_daily_traffic as
select
  date_trunc('day', created_at)::date as day,
  event_type,
  public.normalize_traffic_device(device) as device,
  public.normalize_traffic_source(referrer) as source,
  coalesce(nullif(country, ''), 'Unknown') as country,
  count(*) as event_count,
  count(distinct session_id) as unique_sessions
from public.analytics_events
group by 1, 2, 3, 4, 5;

-- admin_activity_log / admin_notifications / analytics_events already
-- restrict direct table access to admins via RLS (see prior migrations);
-- these views run as their owner (standard Postgres view behavior, same
-- as admin_kpis/admin_revenue_daily already do in this schema) and are
-- only ever queried from admin-gated screens in the app.
create extension if not exists pg_cron;

create or replace function public.detect_abandoned_carts()
returns void language plpgsql as $$
begin
  insert into public.abandoned_carts (cart_id, customer_email, cart_value, abandoned_at)
  select c.id, coalesce(p.email, 'guest'),
         coalesce(sum(ci.quantity * ci.price_at_add), 0), now()
  from public.carts c
  join public.cart_items ci on ci.cart_id = c.id
  left join public.profiles p on p.id = c.user_id
  where c.updated_at < now() - interval '24 hours'
    and not exists (select 1 from public.abandoned_carts ac where ac.cart_id = c.id)
  group by c.id, p.email
  having sum(ci.quantity * ci.price_at_add) > 0;
end;
$$;

select cron.schedule('detect-abandoned-carts', '0 * * * *', 'select public.detect_abandoned_carts();');

create or replace view public.admin_kpis as
select
  (select coalesce(sum(total),0) from public.orders where payment_status = 'Paid') as revenue,
  (select count(*) from public.orders) as orders,
  (select case when count(*) > 0 then round(coalesce(sum(total),0)/count(*),2) else 0 end from public.orders) as average_order_value,
  (select count(*) from public.profiles) as customers,
  (select coalesce(sum(quantity),0) from public.order_items) as items_sold,
  (select case
     when (select coalesce(sum(views),0) from public.products) > 0
     then round((select coalesce(sum(sales_count),0) from public.products)::numeric /
                (select sum(views) from public.products) * 100, 2)
     else 0
   end) as conversion_rate;
