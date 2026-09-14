"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { CarMaintenanceType } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function createVehicle(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const make = String(formData.get("make") ?? "").trim() || null;
  const model = String(formData.get("model") ?? "").trim() || null;
  const registration = String(formData.get("registration") ?? "").trim() || null;
  const yearRaw = formData.get("year");

  const { error } = await supabase.from("car_vehicles").insert({
    user_id: userId,
    make,
    model,
    registration,
    year: yearRaw ? Number(yearRaw) : null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

export async function deleteVehicle(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("car_vehicles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

export async function updateInsurance(vehicleId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const provider = String(formData.get("provider") ?? "").trim() || null;
  const priceRaw = formData.get("price");
  const renewal_date = String(formData.get("renewal_date"));

  const { error } = await supabase.from("car_insurance").insert({
    user_id: userId,
    vehicle_id: vehicleId,
    provider,
    price: priceRaw ? Number(priceRaw) : null,
    renewal_date,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

export async function updateMot(vehicleId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const due_date = String(formData.get("due_date"));
  const last_pass_date = String(formData.get("last_pass_date") ?? "").trim() || null;

  const { error } = await supabase.from("car_mot").insert({
    user_id: userId,
    vehicle_id: vehicleId,
    due_date,
    last_pass_date,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

export async function createMaintenanceEntry(vehicleId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const type = String(formData.get("type")) as CarMaintenanceType;
  const performed_on = String(formData.get("performed_on"));
  const costRaw = formData.get("cost");
  const mileageRaw = formData.get("mileage");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase.from("car_maintenance_log").insert({
    user_id: userId,
    vehicle_id: vehicleId,
    type,
    performed_on,
    cost: costRaw ? Number(costRaw) : null,
    mileage: mileageRaw ? Number(mileageRaw) : null,
    notes,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

export async function deleteMaintenanceEntry(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("car_maintenance_log").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}
