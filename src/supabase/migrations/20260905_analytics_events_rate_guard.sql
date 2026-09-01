create or replace function public.limit_analytics_rate()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.analytics_events
      where session_id = new.session_id
        and created_at > now() - interval '1 minute') > 60 then
    raise exception 'Rate limit exceeded';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_limit_analytics_rate on public.analytics_events;
create trigger trg_limit_analytics_rate
  before insert on public.analytics_events
  for each row execute function public.limit_analytics_rate();