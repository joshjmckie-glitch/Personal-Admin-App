"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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
  const provider = String(formData.get("provider") ?? "").trim() || "Other";
  const account_type = String(formData.get("account_type") ?? "").trim() || "Other";
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
  const provider = String(formData.get("provider") ?? "").trim() || "Other";
  const account_type = String(formData.get("account_type") ?? "").trim() || "Other";
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

export async function setAccountArchived(id: string, archived: boolean) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("investment_accounts").update({ archived }).eq("id", id);
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

function contributionFields(formData: FormData) {
  return {
    amount: Number(formData.get("amount")),
    contributed_on: String(formData.get("contributed_on") || new Date().toISOString().slice(0, 10)),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createContribution(accountId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("investment_contributions")
    .insert({ user_id: userId, account_id: accountId, ...contributionFields(formData) });
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function updateContribution(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("investment_contributions")
    .update(contributionFields(formData))
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function deleteContribution(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("investment_contributions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

function holdingFields(formData: FormData) {
  const quantityRaw = formData.get("quantity");
  return {
    name: String(formData.get("name")),
    quantity: quantityRaw ? Number(quantityRaw) : null,
    value: Number(formData.get("value")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

export async function createHolding(accountId: string, formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const { error } = await supabase
    .from("investment_holdings")
    .insert({ user_id: userId, account_id: accountId, ...holdingFields(formData) });
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function updateHolding(id: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("investment_holdings")
    .update({ ...holdingFields(formData), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function deleteHolding(id: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.from("investment_holdings").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}
