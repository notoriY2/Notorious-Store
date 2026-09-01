-- ============================================================
-- 1. Auto-bump products.views whenever a product_views row lands
--    (currently nothing does this — conversion_rate is stuck at 0)
-- ============================================================
create or replace function public.bump_product_views()
returns trigger language plpgsql as $$
begin
  update public.products set views = views + 1 where id = new.product_id;
  return new;
end;
$$;

drop trigger if exists trg_product_views_bump on public.product_views;
create trigger trg_product_views_bump
  after insert on public.product_views
  for each row execute function public.bump_product_views();

-- ============================================================
-- 2. Decrement product_inventory when an order_item is placed.
--    This cascades into the EXISTING trg_inventory_recalc trigger
--    (updates products.stock) and EXISTING trg_notify_low_stock
--    trigger automatically — no extra wiring needed once this fires.
-- ============================================================
create or replace function public.decrement_inventory_on_order()
returns trigger language plpgsql as $$
begin
  update public.product_inventory
    set available = greatest(available - new.quantity, 0),
        sold      = sold + new.quantity
    where product_id = new.product_id
      and size = new.size;
  return new;
end;
$$;

drop trigger if exists trg_order_items_decrement_inventory on public.order_items;
create trigger trg_order_items_decrement_inventory
  after insert on public.order_items
  for each row execute function public.decrement_inventory_on_order();

-- ============================================================
-- 3. Log every product_inventory.available change into
--    inventory_history automatically (covers both admin manual
--    edits AND the order-driven decrement above in one place).
-- ============================================================
create or replace function public.log_inventory_change()
returns trigger language plpgsql as $$
begin
  if new.available is distinct from old.available then
    insert into public.inventory_history (product_id, size, change, reason)
    values (
      new.product_id,
      new.size,
      new.available - old.available,
      case when new.available < old.available then 'Order sold' else 'Manual adjustment' end
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_inventory_change on public.product_inventory;
create trigger trg_log_inventory_change
  after update on public.product_inventory
  for each row execute function public.log_inventory_change();

-- ============================================================
-- 4. banner_products — links a banner to the products shown
--    when a customer clicks it.
-- ============================================================
create table if not exists public.banner_products (
  banner_id   uuid not null references public.banners(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  position    integer not null default 0,
  primary key (banner_id, product_id)
);
create index if not exists idx_banner_products_banner on public.banner_products(banner_id);

alter table public.banner_products enable row level security;

drop policy if exists "banner_products_public_read" on public.banner_products;
create policy "banner_products_public_read" on public.banner_products
  for select using (true);

drop policy if exists "banner_products_admin_write" on public.banner_products;
create policy "banner_products_admin_write" on public.banner_products
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 5. Safe click/impression counters — callable by anonymous
--    visitors without granting them general UPDATE on banners.
-- ============================================================
create or replace function public.increment_banner_click(p_banner_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.banners set clicks = clicks + 1 where id = p_banner_id;
end;
$$;
grant execute on function public.increment_banner_click(uuid) to anon, authenticated;

create or replace function public.increment_banner_impression(p_banner_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.banners set impressions = impressions + 1 where id = p_banner_id;
end;
$$;
grant execute on function public.increment_banner_impression(uuid) to anon, authenticated;

-- Pre-aggregated view so AdminAnalytics doesn't pull every raw event row
create or replace view public.analytics_daily_summary as
select
  date_trunc('day', created_at)::date as day,
  event_type,
  count(*) as event_count,
  count(distinct session_id) as unique_sessions
from public.analytics_events
group by 1, 2
order by 1 desc;

create or replace view public.analytics_daily_summary as
select
  date_trunc('day', created_at)::date as day,
  event_type,
  count(*) as event_count,
  count(distinct session_id) as unique_sessions
from public.analytics_events
group by 1, 2
order by 1 desc;