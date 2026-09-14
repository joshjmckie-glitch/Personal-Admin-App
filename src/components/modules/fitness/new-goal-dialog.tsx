"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGoal } from "@/lib/actions/fitness";

export function NewGoalDialog() {
  return (
    <FormDialog title="Add goal" triggerLabel="Add goal" submitLabel="Add goal" onSubmit={createGoal}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Sub-25 5k" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="target_date">Target date (optional)</Label>
        <Input id="target_date" name="target_date" type="date" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="How you'll get there" />
      </div>
    </FormDialog>
  );
}
