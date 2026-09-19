"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/** Fires a toast for the strava_connected / strava_error query params the OAuth callback redirects back with, then cleans the URL. */
export function StravaCallbackNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get("strava_connected");
    const error = searchParams.get("strava_error");
    if (!connected && !error) return;

    if (connected) toast.success("Connected to Strava");
    if (error) toast.error(error);

    router.replace("/fitness");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
