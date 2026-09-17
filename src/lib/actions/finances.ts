"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { FinanceCategory, FinanceRecurringExpenseRow, PensionType } from "@/lib/types/database";

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
  const billingDayRaw = formData.get("billing_day");
  return {
    name: String(formData.get("name")),
    category: String(formData.get("category")) as FinanceCategory,
    is_variable: formData.get("is_variable") === "on",
    billing_day: billingDayRaw ? Number(billingDayRaw) : null,
    show_on_car_widget: formData.get("show_on_car_widget") === "on",
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createRecurringExpense(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const fields = recurringExpenseFields(formData);
  // Variable expenses have no user-entered amount — it's maintained as the
  // average of logged entries whenever a log is added/edited/deleted (see
  // recomputeExpenseAverage below), starting at 0 until the first log.
  const amount = fields.is_variable ? 0 : Number(formData.get("amount"));

  const { error } = await supabase
    .from("finance_recurring_expenses")
    .insert({ user_id: userId, ...fields, amount });
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function updateRecurringExpense(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const fields = recurringExpenseFields(formData);
  const update: Partial<FinanceRecurringExpenseRow> = { ...fields };
  // Leave amount untouched for variable expenses — it's the maintained
  // average, not something this form edits directly.
  if (!fields.is_variable) {
    update.amount = Number(formData.get("amount"));
  }

  const { error } = await supabase.from("finance_recurring_expenses").update(update).eq("id", id);
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

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** Keeps a variable expense's `amount` in sync with the average of its logged entries. */
async function recomputeExpenseAverage(supabase: SupabaseClient, expenseId: string) {
  const { data: logs } = await supabase
    .from("finance_expense_logs")
    .select("amount")
    .eq("expense_id", expenseId);

  const amounts = (logs ?? []).map((l) => l.amount);
  const average = amounts.length > 0 ? amounts.reduce((sum, a) => sum + a, 0) / amounts.length : 0;

  await supabase
    .from("finance_recurring_expenses")
    .update({ amount: Math.round(average * 100) / 100 })
    .eq("id", expenseId);
}

function expenseLogFields(formData: FormData) {
  return {
    amount: Number(formData.get("amount")),
    logged_on: String(formData.get("logged_on") || new Date().toISOString().slice(0, 10)),
  };
}

export async function createExpenseLog(expenseId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("finance_expense_logs")
    .insert({ user_id: userId, expense_id: expenseId, ...expenseLogFields(formData) });
  if (error) throw new Error(error.message);

  await recomputeExpenseAverage(supabase, expenseId);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function updateExpenseLog(id: string, expenseId: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("finance_expense_logs")
    .update(expenseLogFields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);

  await recomputeExpenseAverage(supabase, expenseId);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function deleteExpenseLog(id: string, expenseId: string) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("finance_expense_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await recomputeExpenseAverage(supabase, expenseId);

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
