alter table public.admin_email_allowlist
  add column if not exists admin_role admin_role_type not null default 'Admin';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_is_admin boolean;
  v_role admin_role_type;
begin
  select true, a.admin_role into v_is_admin, v_role
  from public.admin_email_allowlist a
  where lower(a.email) = lower(new.email);

  insert into public.profiles (id, email, name, provider, is_admin, admin_role, admin_status)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'provider')::provider_type, 'email'),
    coalesce(v_is_admin, false),
    v_role,
    'Active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;