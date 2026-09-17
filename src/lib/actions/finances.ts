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

// The billing-day field is a native date input (opens a real calendar) — we
// only keep the day-of-month from whatever date is picked, month/year are
// discarded.
function recurringExpenseFields(formData: FormData) {
  const billingDateRaw = formData.get("billing_day");
  const billingDay = billingDateRaw ? Number(String(billingDateRaw).split("-")[2]) : null;

  return {
    name: String(formData.get("name")),
    category: String(formData.get("category")) as FinanceCategory,
    is_variable: formData.get("is_variable") === "on",
    billing_day: billingDay,
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

function currentMonthDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function createRecurringExpense(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const fields = recurringExpenseFields(formData);

  if (fields.is_variable) {
    // A variable expense starts from an estimate for the current month
    // instead of a fixed amount — that estimate becomes the first logged
    // month, and the average (just that one figure, to begin with) is what
    // actually gets stored as `amount`.
    const estimate = Number(formData.get("amount"));
    const { data: expense, error } = await supabase
      .from("finance_recurring_expenses")
      .insert({ user_id: userId, ...fields, amount: estimate })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const { error: logError } = await supabase
      .from("finance_expense_logs")
      .insert({ user_id: userId, expense_id: expense.id, amount: estimate, logged_month: currentMonthDate() });
    if (logError) throw new Error(logError.message);
  } else {
    const { error } = await supabase
      .from("finance_recurring_expenses")
      .insert({ user_id: userId, ...fields, amount: Number(formData.get("amount")) });
    if (error) throw new Error(error.message);
  }

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
  // Native month input submits "YYYY-MM" — store as the 1st of that month.
  const monthRaw = String(formData.get("logged_month") || "");
  const logged_month = monthRaw ? `${monthRaw}-01` : currentMonthDate();

  return {
    amount: Number(formData.get("amount")),
    logged_month,
  };
}

export async function createExpenseLog(expenseId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  // Logging again for a month you've already logged updates that month's
  // figure rather than adding a second entry — the average always reflects
  // one number per calendar month.
  const { error } = await supabase
    .from("finance_expense_logs")
    .upsert(
      { user_id: userId, expense_id: expenseId, ...expenseLogFields(formData) },
      { onConflict: "expense_id,logged_month" }
    );
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
  const payDateRaw = formData.get("pay_day");
  const pay_day = payDateRaw ? Number(String(payDateRaw).split("-")[2]) : null;

  const { error } = await supabase
    .from("finance_salary_settings")
    .upsert(
      {
        user_id: userId,
        annual_salary,
        pension_percent,
        pension_type,
        pay_day,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}
