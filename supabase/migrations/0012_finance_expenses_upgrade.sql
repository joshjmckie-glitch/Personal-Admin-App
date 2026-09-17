-- Optional billing day (for the "coming up" due-date view — leave blank if
-- an expense has no fixed charge date), fixed-vs-variable expenses (a
-- variable one has no set amount; amount instead tracks a running average of
-- logged entries, maintained by the finance actions whenever a log changes),
-- and an opt-in flag to also surface an expense on the Car dashboard card.
alter table public.finance_recurring_expenses
  add column billing_day integer,
  add column is_variable boolean not null default false,
  add column show_on_car_widget boolean not null default false;

alter table public.finance_recurring_expenses
  add constraint finance_recurring_expenses_billing_day_check
  check (billing_day is null or (billing_day between 1 and 31));

create table public.finance_expense_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expense_id uuid not null references public.finance_recurring_expenses (id) on delete cascade,
  amount numeric(12, 2) not null,
  logged_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index finance_expense_logs_expense_idx on public.finance_expense_logs (expense_id, logged_on desc);
select public.apply_owner_policies('finance_expense_logs');
