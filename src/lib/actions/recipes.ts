"use server";

import { revalidatePath } from "next/cache";

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
  photo_url: string | null;
}) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase.from("recipes").insert({ user_id: userId, ...input });
  if (error) throw new Error(error.message);

  revalidatePath("/recipes");
  revalidatePath("/");
}

export async function updateRecipe(
  id: string,
  input: {
    title: string;
    ingredients: string;
    method: string;
    tags: string[];
    photo_url: string | null;
  }
) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("recipes").update(input).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/recipes");
  revalidatePath("/");
}

export async function deleteRecipe(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/recipes");
  revalidatePath("/");
}

export async function createMealPlanEntry(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const recipe_id = String(formData.get("recipe_id") ?? "").trim() || null;
  const title_override = String(formData.get("title_override") ?? "").trim() || null;
  const planned_date = String(formData.get("planned_date"));
  const meal_slot = String(formData.get("meal_slot") || "dinner") as MealSlot;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!recipe_id && !title_override) {
    throw new Error("Pick a recipe or enter a custom meal name");
  }

  const { error } = await supabase.from("meal_plan_entries").insert({
    user_id: userId,
    recipe_id,
    title_override,
    planned_date,
    meal_slot,
    notes,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/recipes");
  revalidatePath("/");
}

export async function deleteMealPlanEntry(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("meal_plan_entries").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/recipes");
  revalidatePath("/");
}
