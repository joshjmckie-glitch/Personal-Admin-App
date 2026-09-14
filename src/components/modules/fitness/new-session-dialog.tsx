"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActivitySelect } from "@/components/modules/fitness/activity-select";
import { createSession } from "@/lib/actions/fitness";

export function NewSessionDialog() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormDialog title="Schedule session" triggerLabel="Add session" submitLabel="Add session" onSubmit={createSession}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activity_type">Activity</Label>
        <ActivitySelect />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduled_date">Date</Label>
          <Input id="scheduled_date" name="scheduled_date" type="date" defaultValue={today} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="duration_minutes">Duration (min)</Label>
          <Input id="duration_minutes" name="duration_minutes" type="number" placeholder="45" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="distance_km">Distance (km, optional)</Label>
        <Input id="distance_km" name="distance_km" type="number" step="0.01" placeholder="5" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Easy pace, intervals, etc." />
      </div>
    </FormDialog>
  );
}
