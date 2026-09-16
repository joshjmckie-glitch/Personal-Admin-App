"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { InvestmentConnectionEnvironment } from "@/lib/types/database";

type ActionResult = void | { error: string };

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

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

// Trading 212 issues an API key + a separate secret and expects HTTP Basic
// auth — the ready "Basic <base64>" header value comes from the
// get_trading212_api_key RPC, which does the encoding server-side.
async function t212Fetch(environment: InvestmentConnectionEnvironment, authorizationHeader: string, path: string) {
  let response: Response;
  try {
    response = await fetch(`${baseUrl(environment)}${path}`, {
      headers: { Authorization: authorizationHeader },
      cache: "no-store",
    });
  } catch (err) {
    throw new Error(errorMessage(err, "Couldn't reach Trading 212 — try again in a moment."));
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Trading 212 rejected that API key/secret — check they're correct and have portfolio access.");
  }
  if (response.status === 429) {
    throw new Error("Trading 212 rate-limited this request — try again in a moment.");
  }
  if (!response.ok) {
    throw new Error(`Trading 212 returned an error (${response.status}).`);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error(errorMessage(err, "Trading 212 returned an unreadable response."));
  }
}

type Trading212Position = {
  ticker: string;
  quantity: number;
  currentPrice: number;
  walletImpact?: { currentValue?: number };
};
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

// currentPrice is in the instrument's own trading currency (USD, EUR, ...),
// not the account's currency — walletImpact.currentValue is Trading 212's
// own figure already converted to the account currency (GBP here), and is
// what actually matches the value shown in the Trading 212 app. Only fall
// back to a naive quantity × currentPrice for the (unexpected) case where
// walletImpact is missing from the response.
function positionValue(p: Trading212Position) {
  const converted = p.walletImpact?.currentValue;
  return typeof converted === "number" && Number.isFinite(converted) ? converted : p.quantity * p.currentPrice;
}

// Next.js redacts every thrown Server Action error's message in production —
// it can't tell a safe error from one leaking secrets, so it always hides
// it behind a generic digest. The only supported way to get a real message
// to the client is to catch everything internally and return it as data, so
// each exported action below is a thin try/catch around an *Impl function
// that's free to throw normally for readability.

async function connectTrading212Impl(accountId: string, formData: FormData) {
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
  if (connectError) throw new Error(connectError.message || "Couldn't save that connection.");

  try {
    const { data: connections, error: keyError } = await supabase.rpc("get_trading212_api_key", {
      p_account_id: accountId,
    });
    if (keyError) throw new Error(keyError.message);
    const connection = connections?.[0];
    if (!connection) throw new Error("Failed to save connection.");
    await t212Fetch(connection.environment, connection.authorization_header, "/api/v0/equity/account/info");
  } catch (err) {
    try {
      await supabase.rpc("disconnect_trading212", { p_account_id: accountId });
    } catch {
      // Best-effort rollback — the error below is the one that matters.
    }
    throw new Error(errorMessage(err, "Couldn't verify that key/secret with Trading 212."));
  }

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function connectTrading212(accountId: string, formData: FormData): Promise<ActionResult> {
  try {
    await connectTrading212Impl(accountId, formData);
  } catch (err) {
    return { error: errorMessage(err, "Couldn't connect to Trading 212.") };
  }
}

async function disconnectTrading212Impl(accountId: string) {
  const { supabase } = await requireUserId();
  const { error } = await supabase.rpc("disconnect_trading212", { p_account_id: accountId });
  if (error) throw new Error(error.message);

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function disconnectTrading212(accountId: string): Promise<ActionResult> {
  try {
    await disconnectTrading212Impl(accountId);
  } catch (err) {
    return { error: errorMessage(err, "Couldn't disconnect Trading 212.") };
  }
}

async function syncTrading212Impl(accountId: string) {
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
      value: Math.round(positionValue(p) * 100) / 100,
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
    const message = errorMessage(err, "Sync failed");
    await supabase.from("investment_connections").update({ last_sync_error: message }).eq("account_id", accountId);
    throw new Error(message);
  }

  revalidatePath("/investments");
  revalidatePath("/");
}

export async function syncTrading212(accountId: string): Promise<ActionResult> {
  try {
    await syncTrading212Impl(accountId);
  } catch (err) {
    return { error: errorMessage(err, "Sync failed.") };
  }
}
