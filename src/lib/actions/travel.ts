"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { TravelCostCategory } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function createTrip(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const name = String(formData.get("name"));
  const destination = String(formData.get("destination") ?? "").trim() || null;
  const start_date = String(formData.get("start_date") ?? "").trim() || null;
  const end_date = String(formData.get("end_date") ?? "").trim() || null;

  const { error } = await supabase
    .from("travel_trips")
    .insert({ user_id: userId, name, destination, start_date, end_date });
  if (error) throw new Error(error.message);

  revalidatePath("/travel");
  revalidatePath("/");
}

export async function deleteTrip(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("travel_trips").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/travel");
  revalidatePath("/");
}

export async function createPackingItem(tripId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const item = String(formData.get("item"));
  const category = String(formData.get("category") ?? "").trim() || null;

  const { error } = await supabase
    .from("travel_packing_items")
    .insert({ user_id: userId, trip_id: tripId, item, category });
  if (error) throw new Error(error.message);

  revalidatePath(`/travel/${tripId}`);
}

export async function togglePackingItem(id: string, tripId: string, packed: boolean) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("travel_packing_items").update({ packed }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/travel/${tripId}`);
}

export async function deletePackingItem(id: string, tripId: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("travel_packing_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/travel/${tripId}`);
}

export async function createItineraryItem(tripId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const item_date = String(formData.get("item_date"));
  const item_time = String(formData.get("item_time") ?? "").trim() || null;
  const title = String(formData.get("title"));
  const location = String(formData.get("location") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  const { error } = await supabase.from("travel_itinerary_items").insert({
    user_id: userId,
    trip_id: tripId,
    item_date,
    item_time,
    title,
    location,
    description,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/travel/${tripId}`);
}

export async function deleteItineraryItem(id: string, tripId: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("travel_itinerary_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/travel/${tripId}`);
}

export async function createCost(tripId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const category = String(formData.get("category")) as TravelCostCategory;
  const description = String(formData.get("description") ?? "").trim() || null;
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "GBP");

  const { error } = await supabase.from("travel_costs").insert({
    user_id: userId,
    trip_id: tripId,
    category,
    description,
    amount,
    currency,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/travel/${tripId}`);
  revalidatePath("/travel");
  revalidatePath("/");
}

export async function deleteCost(id: string, tripId: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("travel_costs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/travel/${tripId}`);
  revalidatePath("/travel");
  revalidatePath("/");
}
