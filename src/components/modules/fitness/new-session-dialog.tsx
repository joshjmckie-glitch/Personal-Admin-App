"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActivitySelect } from "@/components/modules/fitness/activity-select";
import { createSession, updateSession } from "@/lib/actions/fitness";
import type { FitnessSessionRow } from "@/lib/types/database";

export function NewSessionDialog({ session }: { session?: FitnessSessionRow }) {
  const isEdit = Boolean(session);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormDialog
      title={isEdit ? "Edit session" : "Schedule session"}
      submitLabel={isEdit ? "Save changes" : "Add session"}
      triggerLabel={isEdit ? undefined : "Add session"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit session">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) => (isEdit ? updateSession(session!.id, formData) : createSession(formData))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activity_type">Activity</Label>
        <ActivitySelect defaultValue={session?.activity_type ?? "running"} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduled_date">Date</Label>
          <Input
            id="scheduled_date"
            name="scheduled_date"
            type="date"
            defaultValue={session?.scheduled_date ?? today}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="duration_minutes">Duration (min)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            placeholder="45"
            defaultValue={session?.duration_minutes ?? undefined}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="distance_km">Distance (km, optional)</Label>
        <Input
          id="distance_km"
          name="distance_km"
          type="number"
          step="0.01"
          placeholder="5"
          defaultValue={session?.distance_km ?? undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Easy pace, intervals, etc."
          defaultValue={session?.notes ?? undefined}
        />
      </div>
    </FormDialog>
  );
}
