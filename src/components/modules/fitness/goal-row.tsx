"use client";

import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { NewGoalDialog } from "@/components/modules/fitness/new-goal-dialog";
import { deleteGoal, setGoalStatus } from "@/lib/actions/fitness";
import { formatDate } from "@/lib/utils";
import type { FitnessGoalRow } from "@/lib/types/database";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "outline"> = {
  active: "outline",
  completed: "success",
  abandoned: "secondary",
};

export function GoalRow({ goal }: { goal: FitnessGoalRow }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-start justify-between gap-2 border-b border-border/50 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{goal.title}</p>
        {goal.description ? (
          <p className="text-xs text-muted-foreground">{goal.description}</p>
        ) : null}
        {goal.target_date ? (
          <p className="text-xs text-muted-foreground">Target: {formatDate(goal.target_date)}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(() =>
              setGoalStatus(goal.id, goal.status === "completed" ? "active" : "completed")
            )
          }
        >
          <Badge variant={STATUS_VARIANT[goal.status]} className="cursor-pointer capitalize">
            {goal.status}
          </Badge>
        </button>
        <NewGoalDialog goal={goal} />
        <DeleteButton onDelete={() => deleteGoal(goal.id)} label="Delete goal" />
      </div>
    </div>
  );
}
