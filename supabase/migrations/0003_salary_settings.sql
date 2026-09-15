-- Salary & tax settings, plus per-paycheck overtime tracking, for the
-- Finances module's expected-vs-actual take-home comparison.

create table public.finance_salary_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  annual_salary numeric(12, 2) not null,
  pension_percent numeric(5, 2) not null default 0,
  pension_type text not null default 'none' check (pension_type in ('none', 'salary_sacrifice', 'personal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.apply_owner_policies('finance_salary_settings');

alter table public.finance_paychecks
  add column overtime_amount numeric(12, 2);
