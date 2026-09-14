"use client";

import { DeleteButton } from "@/components/modules/delete-button";
import { ACTIVITY_LABEL } from "@/components/modules/fitness/activity-select";
import { deletePersonalBest } from "@/lib/actions/fitness";
import { formatDate } from "@/lib/utils";
import type { FitnessPersonalBestRow } from "@/lib/types/database";

export function PbRow({ pb }: { pb: FitnessPersonalBestRow }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {ACTIVITY_LABEL[pb.activity_type]} · {pb.metric}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(pb.achieved_on)}</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-primary">{pb.value}</span>
        <DeleteButton onDelete={() => deletePersonalBest(pb.id)} label="Delete PB" />
      </div>
    </div>
  );
}
