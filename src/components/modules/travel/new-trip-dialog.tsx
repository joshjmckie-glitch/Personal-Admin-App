"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTrip } from "@/lib/actions/travel";

export function NewTripDialog() {
  return (
    <FormDialog title="Add trip" triggerLabel="Add trip" submitLabel="Add trip" onSubmit={createTrip}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Trip name</Label>
        <Input id="name" name="name" required placeholder="Summer in Portugal" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="destination">Destination</Label>
        <Input id="destination" name="destination" placeholder="Lisbon, Portugal" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">End date</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>
    </FormDialog>
  );
}
