-- Mirrors orders_insert_self_or_admin: a checkout-time transaction insert
-- must be allowed for the customer who owns the order (or a guest, where
-- user_id is null), not just admins. Postgres RLS OR's multiple permissive
-- policies for the same command, so this adds an insert path alongside
-- the existing admin-only "transactions_admin_write" policy without
-- weakening it for select/update/delete.
drop policy if exists "transactions_insert_self_or_admin" on public.payment_transactions;
create policy "transactions_insert_self_or_admin" on public.payment_transactions
  for insert with check (user_id = auth.uid() or user_id is null or public.is_admin());