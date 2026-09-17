-- Replaces the generic show_on_car_widget checkbox with a proper "fuel"
-- category — the Car dashboard card now shows whatever's categorised as
-- fuel, rather than needing a separate manual flag decoupled from category.
alter table public.finance_recurring_expenses drop column show_on_car_widget;

alter table public.finance_recurring_expenses drop constraint finance_recurring_expenses_category_check;
alter table public.finance_recurring_expenses
  add constraint finance_recurring_expenses_category_check
  check (category in ('subscription', 'savings', 'rent', 'bills', 'fuel', 'other'));

-- Variable expenses now track one figure per calendar month (an estimate to
-- start, then the actual each month after) rather than per individual
-- fill-up — logging again for the same month updates that month's figure
-- instead of adding a second entry, so the average is always "average of
-- monthly totals" regardless of how many times you actually paid that month.
alter table public.finance_expense_logs rename column logged_on to logged_month;
alter table public.finance_expense_logs add constraint finance_expense_logs_expense_month_key unique (expense_id, logged_month);
