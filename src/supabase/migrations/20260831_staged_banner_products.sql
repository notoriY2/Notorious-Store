-- Adds "staged" products: products created directly inside a banner
-- editor for testing unusual/new items before they earn a spot on the
-- real storefront floor. Staged products:
--   - are NOT purchasable-catalog members — excluded from
--     getAdminProducts() (the main AdminProducts list) and from
--     useProducts()'s active-catalog fetch (so they never appear on
--     Floor/Grid, in Featured/Hero pickers, or in recommendations).
--   - are ONLY reachable through the single banner they were created
--     under, via banner_products.
--   - "Promote to Floor" (promote_staged_product) is the only way out:
--     it flips is_staged -> false, show_on_floor -> true, assigns a
--     real floor slot, and detaches the product from banner_products
--     in one transaction — the banner goes back to just its other
--     staged products, and the product becomes a normal catalog item.

alter table public.products
  add column if not exists is_staged boolean not null default false;

create index if not exists idx_products_is_staged on public.products(is_staged);

-- Keep low-stock/out-of-stock alerts scoped to real catalog products —
-- a staged/testing product's stock shouldn't trigger inventory alerts.
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
where p.is_staged = false
group by p.id, p.name
order by p.name;

-- ============================================================
-- CREATE STAGED PRODUCT (scoped to one banner)
-- Atomic: product row (is_staged=true, show_on_floor=false) + its
-- per-size inventory + the banner_products link, one transaction.
-- ============================================================
create or replace function public.create_staged_banner_product(
  p_banner_id    uuid,
  p_slug         text,
  p_name         text,
  p_price        numeric,
  p_image        text,
  p_images       text[],
  p_category     public.product_category,
  p_description  text,
  p_features     text[],
  p_size_stocks  jsonb default '{}'::jsonb,
  p_position     integer default 0
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
    slug, name, price, image, images, category, status,
    sold_out, force_sold_out,
    position_top, position_left,
    rotation, scale, z_index,
    description, features,
    show_on_floor, is_staged
  ) values (
    p_slug, p_name, p_price, p_image, coalesce(p_images, '{}'), p_category, 'Active',
    false, false,
    '0px', '0%',
    0, 1, 1,
    p_description, coalesce(p_features, '{}'),
    false, true
  )
  returning id into v_product_id;

  select array_agg(size) into v_valid_sizes
  from public.category_sizes
  where category = p_category;

  insert into public.product_inventory (product_id, size, available)
  select v_product_id, cs.size, greatest(0, coalesce((p_size_stocks ->> cs.size)::int, 0))
  from public.category_sizes cs
  where cs.category = p_category
  on conflict (product_id, size) do update set available = excluded.available;

  delete from public.product_inventory
  where product_id = v_product_id
    and size <> all (coalesce(v_valid_sizes, array[]::text[]));

  insert into public.banner_products (banner_id, product_id, position)
  values (p_banner_id, v_product_id, p_position)
  on conflict (banner_id, product_id) do update set position = excluded.position;

  select to_jsonb(p.*) || jsonb_build_object(
    'sizes', coalesce(
      (select jsonb_agg(jsonb_build_object(
                'size', pi.size, 'available', pi.available,
                'reserved', pi.reserved, 'sold', pi.sold
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

grant execute on function public.create_staged_banner_product(
  uuid, text, text, numeric, text, text[], public.product_category, text, text[], jsonb, integer
) to authenticated;

-- ============================================================
-- UPDATE STAGED PRODUCT — edits its own fields only; never touches
-- the banner link or is_staged/show_on_floor.
-- ============================================================
create or replace function public.update_staged_banner_product(
  p_id            uuid,
  p_name          text,
  p_price         numeric,
  p_image         text,
  p_images        text[],
  p_category      public.product_category,
  p_description   text,
  p_features      text[],
  p_size_stocks   jsonb default null
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
    name        = p_name,
    price       = p_price,
    image       = p_image,
    images      = coalesce(p_images, images),
    category    = p_category,
    description = p_description,
    features    = coalesce(p_features, features)
  where id = p_id and is_staged = true;

  if not found then
    raise exception 'Staged product % not found', p_id;
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

    delete from public.product_inventory
    where product_id = p_id
      and size <> all (coalesce(v_valid_sizes, array[]::text[]));
  end if;

  select to_jsonb(p.*) || jsonb_build_object(
    'sizes', coalesce(
      (select jsonb_agg(jsonb_build_object(
                'size', pi.size, 'available', pi.available,
                'reserved', pi.reserved, 'sold', pi.sold
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

grant execute on function public.update_staged_banner_product(
  uuid, text, numeric, text, text[], public.product_category, text, text[], jsonb
) to authenticated;

-- ============================================================
-- PROMOTE — flips is_staged/show_on_floor, assigns a real floor
-- slot, and detaches from banner_products, atomically.
-- ============================================================
create or replace function public.promote_staged_product(
  p_product_id           uuid,
  p_position_top         text,
  p_position_left        text,
  p_mobile_position_top  text,
  p_mobile_position_left text,
  p_rotation             numeric,
  p_scale                numeric,
  p_z_index              integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only admins can promote products';
  end if;

  update public.products set
    is_staged             = false,
    show_on_floor         = true,
    position_top          = p_position_top,
    position_left         = p_position_left,
    mobile_position_top   = p_mobile_position_top,
    mobile_position_left  = p_mobile_position_left,
    rotation              = p_rotation,
    scale                 = p_scale,
    z_index                = p_z_index
  where id = p_product_id;

  if not found then
    raise exception 'Product % not found', p_product_id;
  end if;

  delete from public.banner_products where product_id = p_product_id;

  select to_jsonb(p.*) into v_result from public.products p where p.id = p_product_id;

  return v_result;
end;
$$;

grant execute on function public.promote_staged_product(
  uuid, text, text, text, text, numeric, numeric, integer
) to authenticated;