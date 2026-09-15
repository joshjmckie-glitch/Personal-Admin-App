"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivitySelect } from "@/components/modules/fitness/activity-select";
import { createPersonalBest, updatePersonalBest } from "@/lib/actions/fitness";
import type { FitnessPersonalBestRow } from "@/lib/types/database";

export function NewPbDialog({ pb }: { pb?: FitnessPersonalBestRow }) {
  const isEdit = Boolean(pb);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormDialog
      title={isEdit ? "Edit PB" : "Log a PB"}
      submitLabel="Save"
      triggerLabel={isEdit ? undefined : "Add PB"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit PB">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) => (isEdit ? updatePersonalBest(pb!.id, formData) : createPersonalBest(formData))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activity_type">Activity</Label>
        <ActivitySelect defaultValue={pb?.activity_type ?? "running"} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="metric">Metric</Label>
        <Input id="metric" name="metric" required placeholder="5k time" defaultValue={pb?.metric} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="value">Value</Label>
        <Input id="value" name="value" required placeholder="24:12" defaultValue={pb?.value} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="achieved_on">Date achieved</Label>
        <Input
          id="achieved_on"
          name="achieved_on"
          type="date"
          defaultValue={pb?.achieved_on ?? today}
          required
        />
      </div>
    </FormDialog>
  );
}
