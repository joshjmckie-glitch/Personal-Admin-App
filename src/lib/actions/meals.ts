"use server";

import { revalidatePath } from "next/cache";
import { eachDayOfInterval, format, parseISO } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import type { MealSlot } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function createRecipe(input: {
  title: string;
  ingredients: string;
  method: string;
  tags: string[];
  meal_type: MealSlot[];
  photo_url: string | null;
}) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase.from("recipes").insert({ user_id: userId, ...input });
  if (error) throw new Error(error.message);

  revalidatePath("/meals");
  revalidatePath("/");
}

export async function updateRecipe(
  id: string,
  input: {
    title: string;
    ingredients: string;
    method: string;
    tags: string[];
    meal_type: MealSlot[];
    photo_url: string | null;
  }
) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("recipes").update(input).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/meals");
  revalidatePath("/");
}

export async function deleteRecipe(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/meals");
  revalidatePath("/");
}

export async function deleteMealPlanEntry(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("meal_plan_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/meals");
  revalidatePath("/");
}

/** Which dates in the range already have this slot filled — used to ask before overwriting. */
export async function checkMealPlanConflicts(input: {
  meal_slot: MealSlot;
  start_date: string;
  end_date: string;
}): Promise<{ conflicts: string[] } | { error: string }> {
  const { supabase } = await requireUserId();

  const { data, error } = await supabase
    .from("meal_plan_entries")
    .select("planned_date")
    .eq("meal_slot", input.meal_slot)
    .gte("planned_date", input.start_date)
    .lte("planned_date", input.end_date);
  if (error) return { error: error.message };

  return { conflicts: (data ?? []).map((row) => row.planned_date) };
}

/** Writes the chosen meal into the given slot for every day in the range, overwriting any existing entry. */
export async function bulkAddMealPlanEntries(input: {
  meal_id: string | null;
  title_override: string | null;
  meal_slot: MealSlot;
  start_date: string;
  end_date: string;
}): Promise<void | { error: string }> {
  const { supabase, userId } = await requireUserId();

  if (!input.meal_id && !input.title_override) {
    return { error: "Pick a meal or enter a custom meal name" };
  }

  const dates = eachDayOfInterval({
    start: parseISO(input.start_date),
    end: parseISO(input.end_date),
  }).map((d) => format(d, "yyyy-MM-dd"));

  const rows = dates.map((planned_date) => ({
    user_id: userId,
    meal_id: input.meal_id,
    title_override: input.title_override,
    planned_date,
    meal_slot: input.meal_slot,
  }));

  const { error } = await supabase
    .from("meal_plan_entries")
    .upsert(rows, { onConflict: "user_id,planned_date,meal_slot" });
  if (error) return { error: error.message };

  revalidatePath("/meals");
  revalidatePath("/");
}
