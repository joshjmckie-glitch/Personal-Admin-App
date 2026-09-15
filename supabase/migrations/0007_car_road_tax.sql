create table public.car_road_tax (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.car_vehicles (id) on delete cascade,
  price numeric(10, 2),
  due_date date not null,
  notes text,
  created_at timestamptz not null default now()
);
select public.apply_owner_policies('car_road_tax');
