
alter type admin_role_type add value if not exists 'Viewer';


   create or replace function public.is_admin_write()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select p.is_admin and p.admin_role is distinct from 'Viewer'
     from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products for insert with check (public.is_admin_write());
drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products for update using (public.is_admin_write());
drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products for delete using (public.is_admin_write());

-- plus the same is_admin() -> is_admin_write() swap for banners, discounts,
-- campaigns, store_settings, product_inventory, category_sizes,
-- admin_email_allowlist, etc.


drop policy if exists "campaigns_admin_only" on public.campaigns;

create policy "campaigns_admin_read" on public.campaigns
  for select using (public.is_admin());

create policy "campaigns_admin_write" on public.campaigns
  for insert with check (public.is_admin_write());

create policy "campaigns_admin_update" on public.campaigns
  for update using (public.is_admin_write());

create policy "campaigns_admin_delete" on public.campaigns
  for delete using (public.is_admin_write());

  create or replace view public.admin_order_status_counts as
select fulfillment_status, count(*) as count
from public.orders
group by fulfillment_status;


drop policy if exists "banners_admin_write" on public.banners;
create policy "banners_admin_write" on public.banners for insert with check (public.is_admin_write());
drop policy if exists "banners_admin_update" on public.banners;
create policy "banners_admin_update" on public.banners for update using (public.is_admin_write());
drop policy if exists "banners_admin_delete" on public.banners;
create policy "banners_admin_delete" on public.banners for delete using (public.is_admin_write());
-- ...repeat for discounts_admin_write, settings_admin_write, inventory_admin_write,
-- category_sizes_admin_write, admin_allowlist_admin_only