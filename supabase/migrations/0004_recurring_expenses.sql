-- Recurring monthly expenses (subscriptions, savings-pot transfers, rent,
-- bills, etc.) — a standing list independent of any single paycheck, since
-- these come out the same every month rather than being re-entered per pay.
create table public.finance_recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null check (category in ('subscription', 'savings', 'rent', 'bills', 'other')),
  amount numeric(12, 2) not null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('finance_recurring_expenses');

-- Superseded by finance_recurring_expenses — had zero rows in production,
-- so there is nothing to migrate.
drop table public.finance_line_items;
