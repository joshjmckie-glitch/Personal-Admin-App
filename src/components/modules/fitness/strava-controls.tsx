"use client";

import { useTransition } from "react";
import { RefreshCw, Unplug, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { syncStrava, disconnectStrava } from "@/lib/actions/strava";
import type { FitnessConnectionRow } from "@/lib/types/database";

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function StravaControls({
  connection,
  authorizeUrl,
}: {
  connection: FitnessConnectionRow | null;
  authorizeUrl: string;
}) {
  const [syncPending, startSync] = useTransition();
  const [disconnectPending, startDisconnect] = useTransition();

  if (!connection) {
    return (
      <Button asChild type="button" variant="secondary" size="sm">
        <a href={authorizeUrl}>
          <LinkIcon />
          Connect Strava
        </a>
      </Button>
    );
  }

  function handleSync() {
    startSync(async () => {
      const result = await syncStrava();
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Synced with Strava");
      }
    });
  }

  function handleDisconnect() {
    startDisconnect(async () => {
      const result = await disconnectStrava();
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Disconnected from Strava");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" size="sm" disabled={syncPending} onClick={handleSync}>
        <RefreshCw className={syncPending ? "animate-spin" : undefined} />
        {syncPending ? "Syncing…" : "Sync now"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label="Disconnect Strava"
        disabled={disconnectPending}
        onClick={handleDisconnect}
      >
        <Unplug className="size-4 text-muted-foreground" />
      </Button>
      <span className={cn("text-xs", connection.last_sync_error ? "text-destructive" : "text-muted-foreground")}>
        {connection.last_sync_error ??
          (connection.last_synced_at ? `Synced ${timeAgo(connection.last_synced_at)}` : "Not synced yet")}
      </span>
    </div>
  );
}
