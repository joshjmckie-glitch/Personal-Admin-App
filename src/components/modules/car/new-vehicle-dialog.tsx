"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVehicle } from "@/lib/actions/car";

export function NewVehicleDialog() {
  return (
    <FormDialog title="Add vehicle" triggerLabel="Add vehicle" submitLabel="Add vehicle" onSubmit={createVehicle}>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" placeholder="Volkswagen" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" placeholder="Golf" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="registration">Registration</Label>
          <Input id="registration" name="registration" placeholder="AB12 CDE" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">Year</Label>
          <Input id="year" name="year" type="number" placeholder="2020" />
        </div>
      </div>
    </FormDialog>
  );
}
