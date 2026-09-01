create or replace function public.enforce_discount_usage_limit()
returns trigger language plpgsql as $$
declare
  v_limit integer;
  v_used integer;
begin
  select usage_limit, used_count into v_limit, v_used
  from public.discounts where id = new.discount_id
  for update;

  if v_limit is not null and v_used >= v_limit then
    raise exception 'Discount usage limit reached';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_discount_limit on public.discount_redemptions;
create trigger trg_enforce_discount_limit
  before insert on public.discount_redemptions
  for each row execute function public.enforce_discount_usage_limit();