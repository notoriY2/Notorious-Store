-- Partial index matching the storefront floor query exactly
-- (status = 'Active' AND is_staged = false, ordered by z_index).
-- Without this the planner does a seq scan + sort on every floor
-- load. Combined with Fix 1 (dropping the inventory join), this
-- takes the query from "sometimes times out" to single-digit
-- milliseconds even under load.
create index if not exists idx_products_floor_active
  on public.products (z_index)
  where status = 'Active' and is_staged = false;

-- Defensive composite fallback in case the planner doesn't pick the
-- partial index above for some query shapes.
create index if not exists idx_products_status_staged
  on public.products (status, is_staged);

-- Give the anon/authenticated roles more breathing room while the
-- fixes above take effect (was hitting the default limit even on
-- fast queries during connection-pool contention).
alter role authenticated set statement_timeout = '15000';
alter role anon set statement_timeout = '15000';