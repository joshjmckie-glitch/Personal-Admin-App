"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVehicle, updateVehicle } from "@/lib/actions/car";
import type { CarVehicleRow } from "@/lib/types/database";

export function NewVehicleDialog({ vehicle }: { vehicle?: CarVehicleRow }) {
  const isEdit = Boolean(vehicle);

  return (
    <FormDialog
      title={isEdit ? "Edit vehicle" : "Add vehicle"}
      submitLabel={isEdit ? "Save changes" : "Add vehicle"}
      triggerLabel={isEdit ? undefined : "Add vehicle"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Edit vehicle">
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) => (isEdit ? updateVehicle(vehicle!.id, formData) : createVehicle(formData))}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" placeholder="Volkswagen" defaultValue={vehicle?.make ?? undefined} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" placeholder="Golf" defaultValue={vehicle?.model ?? undefined} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="registration">Registration</Label>
          <Input
            id="registration"
            name="registration"
            placeholder="AB12 CDE"
            defaultValue={vehicle?.registration ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" placeholder="2020" defaultValue={vehicle?.year ?? undefined} />
        </div>
      </div>
    </FormDialog>
  );
}
