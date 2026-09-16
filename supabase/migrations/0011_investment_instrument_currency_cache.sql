-- Shared reference cache (ticker -> trading currency), not per-user data,
-- so it deliberately doesn't use apply_owner_policies/user_id like every
-- other table — any authenticated user's sync may need to read or extend
-- it, and "SPCX_US_EQ trades in USD" isn't sensitive.
create table public.investment_instrument_currency (
  ticker text primary key,
  currency_code text not null,
  updated_at timestamptz not null default now()
);
alter table public.investment_instrument_currency enable row level security;
create policy "instrument_currency_select" on public.investment_instrument_currency
  for select to authenticated using (true);
create policy "instrument_currency_insert" on public.investment_instrument_currency
  for insert to authenticated with check (true);
create policy "instrument_currency_update" on public.investment_instrument_currency
  for update to authenticated using (true) with check (true);
