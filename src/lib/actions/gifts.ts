"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { GiftStatus } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function createPerson(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const name = String(formData.get("name"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase.from("gift_people").insert({ user_id: userId, name, notes });
  if (error) throw new Error(error.message);

  revalidatePath("/gifts");
  revalidatePath("/");
}

export async function deletePerson(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("gift_people").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/gifts");
  revalidatePath("/");
}

export async function createGiftIdea(personId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const idea = String(formData.get("idea"));
  const priceRaw = formData.get("expected_price");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase.from("gift_ideas").insert({
    user_id: userId,
    person_id: personId,
    idea,
    expected_price: priceRaw ? Number(priceRaw) : null,
    notes,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/gifts");
  revalidatePath("/");
}

export async function setGiftStatus(id: string, status: GiftStatus) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("gift_ideas").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/gifts");
  revalidatePath("/");
}

export async function deleteGiftIdea(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("gift_ideas").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/gifts");
  revalidatePath("/");
}
