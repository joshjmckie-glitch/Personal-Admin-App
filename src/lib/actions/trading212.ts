"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { InvestmentConnectionEnvironment } from "@/lib/types/database";

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function baseUrl(environment: InvestmentConnectionEnvironment) {
  return environment === "demo" ? "https://demo.trading212.com" : "https://live.trading212.com";
}

// Trading 212 issues an API key + a separate secret and expects HTTP Basic
// auth — the ready "Basic <base64>" header value comes from the
// get_trading212_api_key RPC, which does the encoding server-side.
async function t212Fetch(environment: InvestmentConnectionEnvironment, authorizationHeader: string, path: string) {
  const response = await fetch(`${baseUrl(environment)}${path}`, {
    headers: { Authorization: authorizationHeader },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Trading 212 rejected that API key — check it's correct and has portfolio access.");
  }
  if (response.status === 429) {
    throw new Error("Trading 212 rate-limited this request — try again in a moment.");
  }
  if (!response.ok) {
    throw new Error(`Trading 212 returned an error (${response.status}).`);
  }
  return response.json();
}

type Trading212Position = { ticker: string; quantity: number; currentPrice: number };
type Trading212Cash = { free: number };

function isPositionArray(value: unknown): value is Trading212Position[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        p &&
        typeof p === "object" &&
        typeof (p as Trading212Position).ticker === "string" &&
        typeof (p as Trading212Position).quantity === "number" &&
        typeof (p as Trading212Position).currentPrice === "number"
    )
  );
}

function isCash(value: unknown): value is Trading212Cash {
  return Boolean(value) && typeof value === "object" && typeof (value as Trading212Cash).free === "number";
}

export async function connectTrading212(accountId: string, formData: FormData) {
  const { supabase } = await requireUserId();

  const apiKey = String(formData.get("api_key") ?? "").trim();
  const apiSecret = String(formData.get("api_secret") ?? "").trim();
  const environment = (String(formData.get("environment") ?? "live") ||
    "live") as InvestmentConnectionEnvironment;
  if (!apiKey) throw new Error("API key is required");
  if (!apiSecret) throw new Error("API secret is required");

  const { error: connectError } = await supabase.rpc("connect_trading212", {
    p_account_id: accountId,
    p_api_key: apiKey,
    p_api_secret: apiSecret,
    p_environment: environment,
  });
  if (connectError) throw new Error(connectError.message);

  try {
    const { data: connections, error: keyError } = await supabase.rpc("get_trading212_api_key", {
      p_account_id: accountId,
    });
    if (keyError) throw new Error(keyError.message);
    const connection = connections?.[0];
    if (!connection) throw new Error("Failed to save connection.");
    await t212Fetch(connection.environment, connection.authorization_header, "/api/v0/equity/account/info");
  } catch (err) {
    await supabase.rpc("disconnect_trading212", { p_account_id: accountId });
    throw err;
  }

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function disconnectTrading212(accountId: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.rpc("disconnect_trading212", { p_account_id: accountId });
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function syncTrading212(accountId: string) {
  const { supabase, userId } = await requireUserId();

  const { data: connections, error: keyError } = await supabase.rpc("get_trading212_api_key", {
    p_account_id: accountId,
  });
  if (keyError) throw new Error(keyError.message);
  const connection = connections?.[0];
  if (!connection) throw new Error("This account isn't connected to Trading 212.");

  const { authorization_header: authorizationHeader, environment } = connection;

  try {
    const [positionsRaw, cashRaw] = await Promise.all([
      t212Fetch(environment, authorizationHeader, "/api/v0/equity/portfolio"),
      t212Fetch(environment, authorizationHeader, "/api/v0/equity/account/cash"),
    ]);

    if (!isPositionArray(positionsRaw)) throw new Error("Unexpected response from Trading 212 (portfolio).");
    if (!isCash(cashRaw)) throw new Error("Unexpected response from Trading 212 (cash).");

    const holdings = positionsRaw.map((p) => ({
      user_id: userId,
      account_id: accountId,
      name: p.ticker,
      quantity: p.quantity,
      value: Math.round(p.quantity * p.currentPrice * 100) / 100,
    }));
    if (cashRaw.free > 0) {
      holdings.push({
        user_id: userId,
        account_id: accountId,
        name: "Cash",
        quantity: null as unknown as number,
        value: Math.round(cashRaw.free * 100) / 100,
      });
    }
    const total = holdings.reduce((sum, h) => sum + h.value, 0);

    const { error: deleteError } = await supabase
      .from("investment_holdings")
      .delete()
      .eq("account_id", accountId);
    if (deleteError) throw new Error(deleteError.message);

    if (holdings.length > 0) {
      const { error: insertError } = await supabase.from("investment_holdings").insert(holdings);
      if (insertError) throw new Error(insertError.message);
    }

    const { error: accountError } = await supabase
      .from("investment_accounts")
      .update({ current_value: total, updated_at: new Date().toISOString() })
      .eq("id", accountId);
    if (accountError) throw new Error(accountError.message);

    const { error: historyError } = await supabase
      .from("investment_value_history")
      .insert({ user_id: userId, account_id: accountId, value: total });
    if (historyError) throw new Error(historyError.message);

    await supabase
      .from("investment_connections")
      .update({ last_synced_at: new Date().toISOString(), last_sync_error: null })
      .eq("account_id", accountId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    await supabase.from("investment_connections").update({ last_sync_error: message }).eq("account_id", accountId);
    throw err;
  }

  revalidatePath("/investments");
  revalidatePath("/");
}
