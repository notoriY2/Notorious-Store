-- ORDERS
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin_write());

-- INVOICES
drop policy if exists "invoices_admin_write" on public.invoices;
create policy "invoices_admin_write" on public.invoices
  for all using (public.is_admin_write()) with check (public.is_admin_write());

-- CREDIT TRANSACTIONS (admin side only — user's own credit stays user-writable)
drop policy if exists "credit_tx_owner_or_admin" on public.credit_transactions;
create policy "credit_tx_owner_or_admin" on public.credit_transactions
  for all using (user_id = auth.uid() or public.is_admin_write())
  with check (user_id = auth.uid() or public.is_admin_write());

-- PAYMENT METHODS (same pattern — owner or admin-write)
drop policy if exists "payment_methods_owner_or_admin" on public.payment_methods;
create policy "payment_methods_owner_or_admin" on public.payment_methods
  for all using (user_id = auth.uid() or public.is_admin_write())
  with check (user_id = auth.uid() or public.is_admin_write());

-- RETURNS
drop policy if exists "returns_owner_or_admin" on public.returns;
create policy "returns_owner_or_admin" on public.returns
  for all using (user_id = auth.uid() or public.is_admin_write())
  with check (user_id = auth.uid() or public.is_admin_write());

-- CAMPAIGNS (fully, not partially)
drop policy if exists "campaigns_admin_write" on public.campaigns;
drop policy if exists "campaigns_admin_update" on public.campaigns;
drop policy if exists "campaigns_admin_delete" on public.campaigns;
create policy "campaigns_admin_write" on public.campaigns
  for insert with check (public.is_admin_write());
create policy "campaigns_admin_update" on public.campaigns
  for update using (public.is_admin_write());
create policy "campaigns_admin_delete" on public.campaigns
  for delete using (public.is_admin_write());

-- TRANSACTIONS (admin write path only; the insert-self-or-admin policy from
-- 20260829 stays as-is for checkout)
drop policy if exists "transactions_admin_write" on public.payment_transactions;
create policy "transactions_admin_write" on public.payment_transactions
  for all using (public.is_admin_write()) with check (public.is_admin_write());