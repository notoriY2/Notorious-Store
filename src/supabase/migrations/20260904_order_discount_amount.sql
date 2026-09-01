alter table public.orders
  add column if not exists discount_amount numeric(10,2) not null default 0;