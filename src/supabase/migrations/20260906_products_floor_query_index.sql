-- Composite index matching the storefront's exact floor-query pattern
-- (status = 'Active' AND is_staged = false, ORDER BY z_index).
-- Without this, the query does a seq scan + sort, which under load
-- exceeds statement_timeout and surfaces to the client as a 500.
create index if not exists idx_products_floor_query
  on public.products (status, is_staged, z_index);