-- Restores a sane statement_timeout. 15s was set defensively while
-- diagnosing an earlier issue, but it means any transient slowness
-- (cold connection, pool contention) now compounds with client-side
-- retries into 60s+ waits. A 39-row indexed query on idx_products_floor_query
-- should never legitimately need more than a couple seconds.
alter role authenticated set statement_timeout = '6000';
alter role anon set statement_timeout = '6000';