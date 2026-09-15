-- Investments redesign: free-text provider/account type (was a fixed enum,
-- but the user changes accounts often), an archive flag for closed accounts
-- (keeps value history instead of losing it), a contributions log (paid-in
-- vs growth), and per-account holdings for transparency into what's
-- actually inside a portfolio.

alter table public.investment_accounts
  drop constraint investment_accounts_provider_check,
  drop constraint investment_accounts_account_type_check;

alter table public.investment_accounts
  alter column provider set default 'Other',
  alter column account_type set default 'Other',
  add column archived boolean not null default false;

-- ---------------------------------------------------------------------------
-- Contributions: money paid in (or withdrawn, as a negative amount), tracked
-- separately from current_value so gain/loss can be shown per account.
-- ---------------------------------------------------------------------------
create table public.investment_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.investment_accounts (id) on delete cascade,
  amount numeric(14, 2) not null,
  contributed_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);
create index investment_contributions_account_idx on public.investment_contributions (account_id, contributed_on);
select public.apply_owner_policies('investment_contributions');

-- ---------------------------------------------------------------------------
-- Holdings: what's actually inside an account right now (e.g. individual
-- stocks in a Trading 212 portfolio, or coins in a Coinbase account).
-- Informational only — doesn't drive current_value automatically.
-- ---------------------------------------------------------------------------
create table public.investment_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.investment_accounts (id) on delete cascade,
  name text not null,
  quantity numeric(18, 8),
  value numeric(14, 2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index investment_holdings_account_idx on public.investment_holdings (account_id);
select public.apply_owner_policies('investment_holdings');
