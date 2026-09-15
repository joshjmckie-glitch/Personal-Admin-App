"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGoal, updateGoal } from "@/lib/actions/fitness";
import type { FitnessGoalRow } from "@/lib/types/database";

export function NewGoalDialog({ goal }: { goal?: FitnessGoalRow }) {
  const isEdit = Boolean(goal);

  return (
    <FormDialog
      title={isEdit ? "Edit goal" : "Add goal"}
      submitLabel={isEdit ? "Save changes" : "Add goal"}
      triggerLabel={isEdit ? undefined : "Add goal"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit goal">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) => (isEdit ? updateGoal(goal!.id, formData) : createGoal(formData))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Sub-25 5k" defaultValue={goal?.title} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="target_date">Target date (optional)</Label>
        <Input id="target_date" name="target_date" type="date" defaultValue={goal?.target_date ?? undefined} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="How you'll get there"
          defaultValue={goal?.description ?? undefined}
        />
      </div>
    </FormDialog>
  );
}
