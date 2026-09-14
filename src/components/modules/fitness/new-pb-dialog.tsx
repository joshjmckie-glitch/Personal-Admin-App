"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivitySelect } from "@/components/modules/fitness/activity-select";
import { createPersonalBest } from "@/lib/actions/fitness";

export function NewPbDialog() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormDialog title="Log a PB" triggerLabel="Add PB" submitLabel="Save" onSubmit={createPersonalBest}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activity_type">Activity</Label>
        <ActivitySelect />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="metric">Metric</Label>
        <Input id="metric" name="metric" required placeholder="5k time" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="value">Value</Label>
        <Input id="value" name="value" required placeholder="24:12" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="achieved_on">Date achieved</Label>
        <Input id="achieved_on" name="achieved_on" type="date" defaultValue={today} required />
      </div>
    </FormDialog>
  );
}
