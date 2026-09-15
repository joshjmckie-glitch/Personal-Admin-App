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

function vehicleFields(formData: FormData) {
  return {
    make: String(formData.get("make") ?? "").trim() || null,
    model: String(formData.get("model") ?? "").trim() || null,
    registration: String(formData.get("registration") ?? "").trim() || null,
    year: formData.get("year") ? Number(formData.get("year")) : null,
  };
}

export async function createVehicle(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("car_vehicles")
    .insert({ user_id: userId, ...vehicleFields(formData) });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

export async function updateVehicle(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("car_vehicles").update(vehicleFields(formData)).eq("id", id);
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

function insuranceFields(formData: FormData) {
  return {
    provider: String(formData.get("provider") ?? "").trim() || null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    renewal_date: String(formData.get("renewal_date")),
  };
}

/** Logs a new insurance renewal (keeps the previous one as history). */
export async function updateInsurance(vehicleId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("car_insurance")
    .insert({ user_id: userId, vehicle_id: vehicleId, ...insuranceFields(formData) });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

/** Corrects the current insurance record in place (no new history row). */
export async function editInsuranceRecord(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("car_insurance").update(insuranceFields(formData)).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

function motFields(formData: FormData) {
  return {
    due_date: String(formData.get("due_date")),
    last_pass_date: String(formData.get("last_pass_date") ?? "").trim() || null,
  };
}

/** Logs a new MOT record (keeps the previous one as history). */
export async function updateMot(vehicleId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("car_mot")
    .insert({ user_id: userId, vehicle_id: vehicleId, ...motFields(formData) });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

/** Corrects the current MOT record in place (no new history row). */
export async function editMotRecord(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("car_mot").update(motFields(formData)).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

function roadTaxFields(formData: FormData) {
  return {
    price: formData.get("price") ? Number(formData.get("price")) : null,
    due_date: String(formData.get("due_date")),
  };
}

/** Logs a new road tax renewal (keeps the previous one as history). */
export async function updateRoadTax(vehicleId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("car_road_tax")
    .insert({ user_id: userId, vehicle_id: vehicleId, ...roadTaxFields(formData) });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

/** Corrects the current road tax record in place (no new history row). */
export async function editRoadTaxRecord(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("car_road_tax").update(roadTaxFields(formData)).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

function maintenanceFields(formData: FormData) {
  return {
    type: String(formData.get("type")) as CarMaintenanceType,
    performed_on: String(formData.get("performed_on")),
    cost: formData.get("cost") ? Number(formData.get("cost")) : null,
    mileage: formData.get("mileage") ? Number(formData.get("mileage")) : null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createMaintenanceEntry(vehicleId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("car_maintenance_log")
    .insert({ user_id: userId, vehicle_id: vehicleId, ...maintenanceFields(formData) });
  if (error) throw new Error(error.message);

  revalidatePath("/car");
  revalidatePath("/");
}

export async function updateMaintenanceEntry(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("car_maintenance_log")
    .update(maintenanceFields(formData))
    .eq("id", id);
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
