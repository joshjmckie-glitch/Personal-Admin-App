"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { FinanceCategory } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function createPaycheck(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const pay_date = String(formData.get("pay_date"));
  const net_amount = Number(formData.get("net_amount"));
  const grossRaw = formData.get("gross_amount");
  const employer = String(formData.get("employer") ?? "").trim() || null;

  const { error } = await supabase.from("finance_paychecks").insert({
    user_id: userId,
    pay_date,
    net_amount,
    gross_amount: grossRaw ? Number(grossRaw) : null,
    employer,
  });
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

export async function createLineItem(paycheckId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const category = String(formData.get("category")) as FinanceCategory;
  const name = String(formData.get("name"));
  const amount = Number(formData.get("amount"));
  const is_recurring = formData.get("is_recurring") === "on";

  const { error } = await supabase.from("finance_line_items").insert({
    user_id: userId,
    paycheck_id: paycheckId,
    category,
    name,
    amount,
    is_recurring,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}

export async function deleteLineItem(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("finance_line_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/finances");
  revalidatePath("/");
}
