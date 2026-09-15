"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { InvestmentAccountType, InvestmentProvider } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function createAccount(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const name = String(formData.get("name"));
  const provider = String(formData.get("provider")) as InvestmentProvider;
  const account_type = String(formData.get("account_type")) as InvestmentAccountType;
  const current_value = Number(formData.get("current_value") ?? 0);
  const currency = String(formData.get("currency") ?? "GBP");

  const { data: account, error } = await supabase
    .from("investment_accounts")
    .insert({ user_id: userId, name, provider, account_type, current_value, currency })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await supabase
    .from("investment_value_history")
    .insert({ user_id: userId, account_id: account.id, value: current_value });

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function updateAccount(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const name = String(formData.get("name"));
  const provider = String(formData.get("provider")) as InvestmentProvider;
  const account_type = String(formData.get("account_type")) as InvestmentAccountType;
  const currency = String(formData.get("currency") ?? "GBP");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase
    .from("investment_accounts")
    .update({ name, provider, account_type, currency, notes, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function deleteAccount(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("investment_accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function logValue(accountId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const value = Number(formData.get("value"));
  const recorded_at = String(formData.get("recorded_at") || new Date().toISOString().slice(0, 10));

  const { error: historyError } = await supabase
    .from("investment_value_history")
    .insert({ user_id: userId, account_id: accountId, value, recorded_at });
  if (historyError) throw new Error(historyError.message);

  const { error: updateError } = await supabase
    .from("investment_accounts")
    .update({ current_value: value, updated_at: new Date().toISOString() })
    .eq("id", accountId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath("/investments");
  revalidatePath("/");
}
