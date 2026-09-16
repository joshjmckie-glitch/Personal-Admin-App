"use client";

import { useTransition } from "react";
import { RefreshCw, Unplug } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { syncTrading212, disconnectTrading212 } from "@/lib/actions/trading212";
import type { InvestmentConnectionRow } from "@/lib/types/database";

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function Trading212SyncControls({
  accountId,
  connection,
}: {
  accountId: string;
  connection: InvestmentConnectionRow;
}) {
  const [syncPending, startSync] = useTransition();
  const [disconnectPending, startDisconnect] = useTransition();

  function handleSync() {
    startSync(async () => {
      const result = await syncTrading212(accountId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Synced with Trading 212");
      }
    });
  }

  function handleDisconnect() {
    startDisconnect(async () => {
      const result = await disconnectTrading212(accountId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Disconnected from Trading 212");
      }
    });
  }

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" size="sm" disabled={syncPending} onClick={handleSync}>
        <RefreshCw className={syncPending ? "animate-spin" : undefined} />
        {syncPending ? "Syncing…" : "Sync now"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label="Disconnect Trading 212"
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
