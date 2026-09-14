"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { FitnessActivityType } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function createGoal(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const title = String(formData.get("title"));
  const description = String(formData.get("description") ?? "").trim() || null;
  const target_date = String(formData.get("target_date") ?? "").trim() || null;

  const { error } = await supabase
    .from("fitness_goals")
    .insert({ user_id: userId, title, description, target_date });
  if (error) throw new Error(error.message);

  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function setGoalStatus(id: string, status: "active" | "completed" | "abandoned") {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("fitness_goals").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function deleteGoal(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("fitness_goals").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function createSession(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const activity_type = String(formData.get("activity_type")) as FitnessActivityType;
  const scheduled_date = String(formData.get("scheduled_date"));
  const durationRaw = formData.get("duration_minutes");
  const distanceRaw = formData.get("distance_km");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase.from("fitness_sessions").insert({
    user_id: userId,
    activity_type,
    scheduled_date,
    duration_minutes: durationRaw ? Number(durationRaw) : null,
    distance_km: distanceRaw ? Number(distanceRaw) : null,
    notes,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function toggleSessionCompleted(id: string, completed: boolean) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("fitness_sessions").update({ completed }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function deleteSession(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("fitness_sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function createPersonalBest(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const activity_type = String(formData.get("activity_type")) as FitnessActivityType;
  const metric = String(formData.get("metric"));
  const value = String(formData.get("value"));
  const achieved_on = String(formData.get("achieved_on") || new Date().toISOString().slice(0, 10));

  const { error } = await supabase
    .from("fitness_personal_bests")
    .insert({ user_id: userId, activity_type, metric, value, achieved_on });
  if (error) throw new Error(error.message);

  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function deletePersonalBest(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("fitness_personal_bests").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/fitness");
  revalidatePath("/");
}
