alter table public.finance_salary_settings add column pay_day integer;
alter table public.finance_salary_settings
  add constraint finance_salary_settings_pay_day_check
  check (pay_day is null or (pay_day between 1 and 31));
