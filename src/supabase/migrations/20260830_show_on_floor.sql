-- Lets admins fully build out a product (price, images, inventory,
-- sizes) and link it into a banner or hero collection as a "sneak
-- peek" / staged item, WITHOUT it also appearing on the main
-- storefront Product Floor or Grid — independent of `status`, which
-- still controls whether the product is purchasable at all.
-- Defaults to true so every existing product's visible behavior is
-- unchanged.

alter table public.products
  add column if not exists show_on_floor boolean not null default true;

-- Drop the old 18-arg / 19-arg signatures before recreating with the
-- new trailing parameter — CREATE OR REPLACE requires an identical
-- parameter list to replace in place; adding a parameter creates a
-- new overload unless the old one is explicitly dropped first.

drop function if exists public.create_product_with_inventory(
  text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb
);

drop function if exists public.update_product_with_inventory(
  uuid, text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb
);

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
  p_size_stocks           jsonb default '{}'::jsonb,
  p_show_on_floor         boolean default true
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
    slug, name, price, image, images, category, status, sold_out, force_sold_out,
    position_top, position_left, mobile_position_top, mobile_position_left,
    rotation, scale, z_index, description, features, show_on_floor
  ) values (
    p_slug, p_name, p_price, p_image, coalesce(p_images, '{}'), p_category, p_status,
    coalesce(p_sold_out, false), coalesce(p_sold_out, false),
    coalesce(p_position_top, '0px'), coalesce(p_position_left, '0%'), p_mobile_position_top, p_mobile_position_left,
    coalesce(p_rotation, 0), coalesce(p_scale, 1), coalesce(p_z_index, 1), p_description, coalesce(p_features, '{}'),
    coalesce(p_show_on_floor, true)
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

revoke all on function public.create_product_with_inventory(
  text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb, boolean
) from public;

grant execute on function public.create_product_with_inventory(
  text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb, boolean
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
  p_size_stocks           jsonb default null,
  p_show_on_floor         boolean default null
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
    force_sold_out        = coalesce(p_sold_out, force_sold_out),
    position_top          = coalesce(p_position_top, position_top),
    position_left         = coalesce(p_position_left, position_left),
    mobile_position_top   = p_mobile_position_top,
    mobile_position_left  = p_mobile_position_left,
    rotation               = coalesce(p_rotation, rotation),
    scale                  = coalesce(p_scale, scale),
    z_index                = coalesce(p_z_index, z_index),
    description            = p_description,
    features               = coalesce(p_features, features),
    show_on_floor          = coalesce(p_show_on_floor, show_on_floor)
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

    delete from public.product_inventory
    where product_id = p_id
      and size <> all (coalesce(v_valid_sizes, array[]::text[]));
  else
    update public.products p
    set sold_out = (
      coalesce((select sum(available) from public.product_inventory where product_id = p.id), 0) = 0
    ) or p.force_sold_out
    where p.id = p_id;
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

revoke all on function public.update_product_with_inventory(
  uuid, text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb, boolean
) from public;

grant execute on function public.update_product_with_inventory(
  uuid, text, text, numeric, text, text[], public.product_category, public.product_status, boolean,
  text, text, text, text, numeric, numeric, integer, text, text[], jsonb, boolean
) to authenticated;