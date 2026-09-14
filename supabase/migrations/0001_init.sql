-- Life Admin App — initial schema
-- Every table is scoped by user_id with Row Level Security enabled from day one,
-- so per-user data isolation is correct even with a single account today.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user, created automatically on signup)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  theme_preference text not null default 'dark' check (theme_preference in ('dark', 'light')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper: apply standard "owner only" RLS policies to a table with user_id
-- ---------------------------------------------------------------------------
create or replace function public.apply_owner_policies(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security;', table_name);
  execute format(
    'create policy "%s_select_own" on public.%I for select using (auth.uid() = user_id);',
    table_name, table_name
  );
  execute format(
    'create policy "%s_insert_own" on public.%I for insert with check (auth.uid() = user_id);',
    table_name, table_name
  );
  execute format(
    'create policy "%s_update_own" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);',
    table_name, table_name
  );
  execute format(
    'create policy "%s_delete_own" on public.%I for delete using (auth.uid() = user_id);',
    table_name, table_name
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Finances
-- ---------------------------------------------------------------------------
create table public.finance_paychecks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pay_date date not null,
  net_amount numeric(12, 2) not null,
  gross_amount numeric(12, 2),
  employer text,
  notes text,
  created_at timestamptz not null default now()
);
create index finance_paychecks_user_date_idx on public.finance_paychecks (user_id, pay_date desc);
select public.apply_owner_policies('finance_paychecks');

create table public.finance_line_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  paycheck_id uuid not null references public.finance_paychecks (id) on delete cascade,
  category text not null check (category in ('subscription', 'savings', 'rent', 'bills', 'other')),
  name text not null,
  amount numeric(12, 2) not null,
  is_recurring boolean not null default true,
  created_at timestamptz not null default now()
);
create index finance_line_items_paycheck_idx on public.finance_line_items (paycheck_id);
select public.apply_owner_policies('finance_line_items');

-- ---------------------------------------------------------------------------
-- Investments
-- ---------------------------------------------------------------------------
create table public.investment_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  provider text not null default 'other' check (
    provider in ('chase', 'moneybox', 'trading212', 'coinbase', 'other')
  ),
  account_type text not null default 'other' check (
    account_type in ('cash_savings', 'isa', 'brokerage', 'crypto', 'pension', 'other')
  ),
  sync_mode text not null default 'manual' check (sync_mode in ('manual', 'trading212', 'coinbase')),
  current_value numeric(14, 2) not null default 0,
  currency text not null default 'GBP',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
select public.apply_owner_policies('investment_accounts');

create table public.investment_value_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.investment_accounts (id) on delete cascade,
  value numeric(14, 2) not null,
  recorded_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index investment_value_history_account_idx on public.investment_value_history (account_id, recorded_at);
select public.apply_owner_policies('investment_value_history');

-- ---------------------------------------------------------------------------
-- Fitness
-- ---------------------------------------------------------------------------
create table public.fitness_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('fitness_goals');

create table public.fitness_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_type text not null check (
    activity_type in ('running', 'cycling', 'kettlebell', 'strength', 'other')
  ),
  scheduled_date date not null,
  duration_minutes integer,
  distance_km numeric(6, 2),
  notes text,
  completed boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'strava')),
  created_at timestamptz not null default now()
);
create index fitness_sessions_user_date_idx on public.fitness_sessions (user_id, scheduled_date desc);
select public.apply_owner_policies('fitness_sessions');

create table public.fitness_personal_bests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_type text not null check (
    activity_type in ('running', 'cycling', 'kettlebell', 'strength', 'other')
  ),
  metric text not null,
  value text not null,
  achieved_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('fitness_personal_bests');

-- ---------------------------------------------------------------------------
-- Car
-- ---------------------------------------------------------------------------
create table public.car_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  make text,
  model text,
  registration text,
  year integer,
  notes text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('car_vehicles');

create table public.car_insurance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.car_vehicles (id) on delete cascade,
  provider text,
  price numeric(10, 2),
  renewal_date date not null,
  notes text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('car_insurance');

create table public.car_mot (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.car_vehicles (id) on delete cascade,
  due_date date not null,
  last_pass_date date,
  notes text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('car_mot');

create table public.car_maintenance_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.car_vehicles (id) on delete cascade,
  type text not null check (type in ('service', 'tyre_change', 'repair')),
  performed_on date not null,
  cost numeric(10, 2),
  mileage integer,
  notes text,
  created_at timestamptz not null default now()
);
create index car_maintenance_log_vehicle_idx on public.car_maintenance_log (vehicle_id, performed_on desc);
select public.apply_owner_policies('car_maintenance_log');

-- ---------------------------------------------------------------------------
-- Recipes & meal prep
-- ---------------------------------------------------------------------------
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  ingredients text not null default '',
  method text not null default '',
  tags text[] not null default '{}',
  photo_url text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('recipes');

create table public.meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete set null,
  title_override text,
  planned_date date not null,
  meal_slot text not null default 'dinner' check (
    meal_slot in ('breakfast', 'lunch', 'dinner', 'snack')
  ),
  notes text,
  created_at timestamptz not null default now()
);
create index meal_plan_entries_user_date_idx on public.meal_plan_entries (user_id, planned_date);
select public.apply_owner_policies('meal_plan_entries');

-- ---------------------------------------------------------------------------
-- Travel
-- ---------------------------------------------------------------------------
create table public.travel_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  destination text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('travel_trips');

create table public.travel_packing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trip_id uuid not null references public.travel_trips (id) on delete cascade,
  item text not null,
  category text,
  packed boolean not null default false,
  created_at timestamptz not null default now()
);
create index travel_packing_items_trip_idx on public.travel_packing_items (trip_id);
select public.apply_owner_policies('travel_packing_items');

create table public.travel_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trip_id uuid not null references public.travel_trips (id) on delete cascade,
  item_date date not null,
  item_time time,
  title text not null,
  description text,
  location text,
  created_at timestamptz not null default now()
);
create index travel_itinerary_items_trip_idx on public.travel_itinerary_items (trip_id, item_date);
select public.apply_owner_policies('travel_itinerary_items');

create table public.travel_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trip_id uuid not null references public.travel_trips (id) on delete cascade,
  category text not null default 'other' check (
    category in ('flights', 'hotel', 'food', 'transport', 'activities', 'other')
  ),
  description text,
  amount numeric(12, 2) not null,
  currency text not null default 'GBP',
  created_at timestamptz not null default now()
);
create index travel_costs_trip_idx on public.travel_costs (trip_id);
select public.apply_owner_policies('travel_costs');

-- ---------------------------------------------------------------------------
-- Gifts
-- ---------------------------------------------------------------------------
create table public.gift_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  notes text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('gift_people');

create table public.gift_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  person_id uuid not null references public.gift_people (id) on delete cascade,
  idea text not null,
  expected_price numeric(10, 2),
  status text not null default 'idea' check (status in ('idea', 'purchased', 'given')),
  notes text,
  created_at timestamptz not null default now()
);
create index gift_ideas_person_idx on public.gift_ideas (person_id);
select public.apply_owner_policies('gift_ideas');
