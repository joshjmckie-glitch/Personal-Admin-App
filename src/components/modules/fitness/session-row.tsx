"use client";

import { useTransition } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { ACTIVITY_LABEL } from "@/lib/modules/fitness-activities";
import { NewSessionDialog } from "@/components/modules/fitness/new-session-dialog";
import { deleteSession, toggleSessionCompleted } from "@/lib/actions/fitness";
import { cn, formatDate } from "@/lib/utils";
import type { FitnessSessionRow } from "@/lib/types/database";

export function SessionRow({ session }: { session: FitnessSessionRow }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 border-b border-border/50 py-2.5 last:border-b-0">
      <Checkbox
        checked={session.completed}
        disabled={pending}
        onCheckedChange={(checked) =>
          startTransition(() => toggleSessionCompleted(session.id, checked === true))
        }
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", session.completed && "text-muted-foreground line-through")}>
          {ACTIVITY_LABEL[session.activity_type]} · {formatDate(session.scheduled_date)}
        </p>
        {(session.duration_minutes || session.distance_km || session.avg_heartrate || session.elevation_gain_m) && (
          <p className="text-xs text-muted-foreground">
            {[
              session.duration_minutes ? `${session.duration_minutes} min` : null,
              session.distance_km ? `${session.distance_km} km` : null,
              session.avg_heartrate ? `${Math.round(session.avg_heartrate)} bpm avg` : null,
              session.elevation_gain_m ? `${Math.round(session.elevation_gain_m)} m elevation` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>
      {session.source === "strava" ? <Badge variant="secondary">Strava</Badge> : null}
      <NewSessionDialog session={session} />
      <DeleteButton onDelete={() => deleteSession(session.id)} label="Delete session" />
    </div>
  );
}
