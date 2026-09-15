"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTrip, updateTrip } from "@/lib/actions/travel";
import type { TravelTripRow } from "@/lib/types/database";

export function NewTripDialog({ trip }: { trip?: TravelTripRow }) {
  const isEdit = Boolean(trip);

  return (
    <FormDialog
      title={isEdit ? "Edit trip" : "Add trip"}
      submitLabel={isEdit ? "Save changes" : "Add trip"}
      triggerLabel={isEdit ? undefined : "Add trip"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Edit trip">
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) => (isEdit ? updateTrip(trip!.id, formData) : createTrip(formData))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Trip name</Label>
        <Input id="name" name="name" required placeholder="Summer in Portugal" defaultValue={trip?.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          name="destination"
          placeholder="Lisbon, Portugal"
          defaultValue={trip?.destination ?? undefined}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={trip?.start_date ?? undefined} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="end_date">End date</Label>
          <Input id="end_date" name="end_date" type="date" defaultValue={trip?.end_date ?? undefined} />
        </div>
      </div>
    </FormDialog>
  );
}
