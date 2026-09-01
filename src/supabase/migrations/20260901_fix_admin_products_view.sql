-- 20260901_fix_admin_products_view.sql
-- CREATE OR REPLACE VIEW can only append columns at the end — it can't
-- handle the underlying `products` column order shifting in the middle
-- (which happened as force_sold_out/show_on_floor/is_staged were added
-- via separate ALTER TABLE statements). Drop and recreate instead.

drop view if exists public.admin_products_view;

create view public.admin_products_view as
select
  p.*,
  case when p.views > 0
    then round((p.sales_count::numeric / p.views) * 100, 2)
    else 0
  end as conversion_rate
from public.products p;