-- Meal type tags on recipes ("meals")
alter table public.recipes
  add column meal_type text[] not null default '{}';
alter table public.recipes
  add constraint recipes_meal_type_check
  check (meal_type <@ array['breakfast', 'lunch', 'tea']::text[]);

-- Meal plan: rename recipe_id -> meal_id, collapse slots to breakfast/lunch/tea,
-- and enforce one meal per slot per day (also backs the overwrite-confirmation check).
alter table public.meal_plan_entries rename column recipe_id to meal_id;
alter table public.meal_plan_entries drop constraint meal_plan_entries_meal_slot_check;
alter table public.meal_plan_entries alter column meal_slot drop default;
alter table public.meal_plan_entries
  add constraint meal_plan_entries_meal_slot_check
  check (meal_slot in ('breakfast', 'lunch', 'tea'));
alter table public.meal_plan_entries
  add constraint meal_plan_entries_meal_or_title_check
  check (meal_id is not null or title_override is not null);
alter table public.meal_plan_entries
  add constraint meal_plan_entries_unique_slot
  unique (user_id, planned_date, meal_slot);
