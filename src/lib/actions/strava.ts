"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { mapStravaActivityType } from "@/lib/modules/strava";

type ActionResult = void | { error: string };
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

// Next.js redacts every thrown Server Action error's message in production,
// so each exported action is a thin try/catch around an *Impl function that
// returns { error } as data instead — same pattern as the Trading 212
// integration.

type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  athlete?: { id: number };
};

function stravaCredentials() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Strava isn't configured yet — missing STRAVA_CLIENT_ID/STRAVA_CLIENT_SECRET.");
  }
  return { clientId, clientSecret };
}

/** Exchanges the OAuth `code` Strava's redirect handed back for tokens, and stores the connection. Called from the callback route. */
export async function exchangeStravaCode(code: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUserId();
    const { clientId, clientSecret } = stravaCredentials();

    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });
    if (!response.ok) throw new Error("Strava rejected that authorization — try connecting again.");
    const tokens = (await response.json()) as StravaTokenResponse;

    const { error } = await supabase.rpc("connect_strava", {
      p_athlete_id: tokens.athlete?.id ?? null,
      p_access_token: tokens.access_token,
      p_refresh_token: tokens.refresh_token,
      p_expires_at: new Date(tokens.expires_at * 1000).toISOString(),
    });
    if (error) throw new Error(error.message || "Couldn't save that connection.");

    revalidatePath("/fitness");
    revalidatePath("/");
  } catch (err) {
    return { error: errorMessage(err, "Couldn't connect to Strava.") };
  }
}

export async function disconnectStrava(): Promise<ActionResult> {
  try {
    const { supabase } = await requireUserId();
    const { error } = await supabase.rpc("disconnect_strava");
    if (error) throw new Error(error.message);
    revalidatePath("/fitness");
    revalidatePath("/");
  } catch (err) {
    return { error: errorMessage(err, "Couldn't disconnect Strava.") };
  }
}

/** Returns a valid access token, silently refreshing it first if it's expired (or about to). Throws if not connected. */
async function getValidAccessToken(supabase: SupabaseClient): Promise<string> {
  const { data: connections, error } = await supabase.rpc("get_strava_tokens");
  if (error) throw new Error(error.message);
  const connection = connections?.[0];
  if (!connection) throw new Error("Not connected to Strava.");

  const expiresAt = new Date(connection.token_expires_at).getTime();
  const fiveMinutes = 5 * 60 * 1000;
  if (expiresAt - Date.now() > fiveMinutes) {
    return connection.access_token;
  }

  const { clientId, clientSecret } = stravaCredentials();
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error("Strava rejected the refresh — try disconnecting and reconnecting.");
  const tokens = (await response.json()) as StravaTokenResponse;

  const { error: updateError } = await supabase.rpc("update_strava_tokens", {
    p_connection_id: connection.connection_id,
    p_access_token: tokens.access_token,
    p_refresh_token: tokens.refresh_token,
    p_expires_at: new Date(tokens.expires_at * 1000).toISOString(),
  });
  if (updateError) throw new Error(updateError.message);

  return tokens.access_token;
}

type StravaActivity = {
  id: number;
  type: string;
  name: string;
  start_date_local: string;
  moving_time: number;
  distance: number;
  average_heartrate?: number;
  total_elevation_gain?: number;
};

function isActivityArray(value: unknown): value is StravaActivity[] {
  return (
    Array.isArray(value) &&
    value.every(
      (a) =>
        a &&
        typeof a === "object" &&
        typeof (a as StravaActivity).id === "number" &&
        typeof (a as StravaActivity).type === "string" &&
        typeof (a as StravaActivity).start_date_local === "string"
    )
  );
}

async function syncStravaImpl() {
  const { supabase, userId } = await requireUserId();

  const { data: connections, error: connError } = await supabase.rpc("get_strava_tokens");
  if (connError) throw new Error(connError.message);
  const connectionRow = connections?.[0];
  if (!connectionRow) throw new Error("Not connected to Strava.");

  try {
    const accessToken = await getValidAccessToken(supabase);

    const { data: connectionMeta } = await supabase
      .from("fitness_connections")
      .select("last_synced_at")
      .eq("provider", "strava")
      .maybeSingle();

    const after = connectionMeta?.last_synced_at
      ? Math.floor(new Date(connectionMeta.last_synced_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
    );
    if (response.status === 401) throw new Error("Strava access was revoked — reconnect to continue syncing.");
    if (response.status === 429) throw new Error("Strava rate-limited this request — try again in a moment.");
    if (!response.ok) throw new Error(`Strava returned an error (${response.status}).`);

    const activitiesRaw = await response.json();
    if (!isActivityArray(activitiesRaw)) throw new Error("Unexpected response from Strava.");

    for (const activity of activitiesRaw) {
      const scheduledDate = activity.start_date_local.slice(0, 10);
      const activityType = mapStravaActivityType(activity.type);
      const fields = {
        activity_type: activityType,
        duration_minutes: Math.round(activity.moving_time / 60),
        distance_km: activity.distance > 0 ? Math.round((activity.distance / 1000) * 100) / 100 : null,
        avg_heartrate: activity.average_heartrate ?? null,
        elevation_gain_m: activity.total_elevation_gain ?? null,
        completed: true,
        source: "strava" as const,
        strava_activity_id: activity.id,
      };

      const { data: existing } = await supabase
        .from("fitness_sessions")
        .select("id")
        .eq("strava_activity_id", activity.id)
        .maybeSingle();

      if (existing) {
        await supabase.from("fitness_sessions").update(fields).eq("id", existing.id);
        continue;
      }

      // A manual, not-yet-completed session already planned for this day + activity — fill it in
      // rather than creating a duplicate row, so ticking off "the plan" happens automatically.
      const { data: matchingPlanned } = await supabase
        .from("fitness_sessions")
        .select("id")
        .eq("scheduled_date", scheduledDate)
        .eq("activity_type", activityType)
        .eq("completed", false)
        .is("strava_activity_id", null)
        .limit(1)
        .maybeSingle();

      if (matchingPlanned) {
        await supabase.from("fitness_sessions").update(fields).eq("id", matchingPlanned.id);
      } else {
        await supabase.from("fitness_sessions").insert({
          ...fields,
          user_id: userId,
          scheduled_date: scheduledDate,
          notes: activity.name || null,
        });
      }
    }

    await supabase
      .from("fitness_connections")
      .update({ last_synced_at: new Date().toISOString(), last_sync_error: null })
      .eq("id", connectionRow.connection_id);
  } catch (err) {
    const message = errorMessage(err, "Sync failed");
    await supabase.from("fitness_connections").update({ last_sync_error: message }).eq("id", connectionRow.connection_id);
    throw new Error(message);
  }

  revalidatePath("/fitness");
  revalidatePath("/");
}

export async function syncStrava(): Promise<ActionResult> {
  try {
    await syncStravaImpl();
  } catch (err) {
    return { error: errorMessage(err, "Sync failed.") };
  }
}
