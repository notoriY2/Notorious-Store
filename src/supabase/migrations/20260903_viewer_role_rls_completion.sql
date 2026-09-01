-- DISCOUNTS
drop policy if exists "discounts_admin_write" on public.discounts;
create policy "discounts_admin_write" on public.discounts
  for all using (public.is_admin_write()) with check (public.is_admin_write());

-- STORE SETTINGS
drop policy if exists "settings_admin_write" on public.store_settings;
create policy "settings_admin_write" on public.store_settings
  for all using (public.is_admin_write()) with check (public.is_admin_write());

-- PRODUCT INVENTORY
drop policy if exists "inventory_admin_write" on public.product_inventory;
create policy "inventory_admin_write" on public.product_inventory
  for all using (public.is_admin_write()) with check (public.is_admin_write());

-- CATEGORY SIZES
drop policy if exists "category_sizes_admin_write" on public.category_sizes;
create policy "category_sizes_admin_write" on public.category_sizes
  for all using (public.is_admin_write()) with check (public.is_admin_write());

-- ADMIN EMAIL ALLOWLIST (split read/write since it has no public read policy)
drop policy if exists "admin_allowlist_admin_only" on public.admin_email_allowlist;
create policy "admin_allowlist_admin_read" on public.admin_email_allowlist
  for select using (public.is_admin());
create policy "admin_allowlist_admin_write" on public.admin_email_allowlist
  for insert with check (public.is_admin_write());
create policy "admin_allowlist_admin_update" on public.admin_email_allowlist
  for update using (public.is_admin_write());
create policy "admin_allowlist_admin_delete" on public.admin_email_allowlist
  for delete using (public.is_admin_write());