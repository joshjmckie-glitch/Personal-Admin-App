"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { FinanceCategory, PensionType } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function paycheckFields(formData: FormData) {
  const pay_date = String(formData.get("pay_date"));
  const net_amount = Number(formData.get("net_amount"));
  const grossRaw = formData.get("gross_amount");
  const overtimeRaw = formData.get("overtime_amount");
  const employer = String(formData.get("employer") ?? "").trim() || null;

  return {
    pay_date,
    net_amount,
    gross_amount: grossRaw ? Number(grossRaw) : null,
    overtime_amount: overtimeRaw ? Number(overtimeRaw) : null,
    employer,
  };
}

export async function createPaycheck(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase.from("finance_paychecks").insert({
    user_id: userId,
    ...paycheckFields(formData),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function updatePaycheck(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("finance_paychecks")
    .update(paycheckFields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function deletePaycheck(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("finance_paychecks").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

function recurringExpenseFields(formData: FormData) {
  return {
    name: String(formData.get("name")),
    category: String(formData.get("category")) as FinanceCategory,
    amount: Number(formData.get("amount")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createRecurringExpense(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("finance_recurring_expenses")
    .insert({ user_id: userId, ...recurringExpenseFields(formData) });
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function updateRecurringExpense(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("finance_recurring_expenses")
    .update(recurringExpenseFields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function toggleRecurringExpenseActive(id: string, active: boolean) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("finance_recurring_expenses")
    .update({ active })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function deleteRecurringExpense(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("finance_recurring_expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function saveSalarySettings(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const annual_salary = Number(formData.get("annual_salary"));
  const pension_percent = Number(formData.get("pension_percent") ?? 0);
  const pension_type = String(formData.get("pension_type") ?? "none") as PensionType;

  const { error } = await supabase
    .from("finance_salary_settings")
    .upsert(
      { user_id: userId, annual_salary, pension_percent, pension_type, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}
