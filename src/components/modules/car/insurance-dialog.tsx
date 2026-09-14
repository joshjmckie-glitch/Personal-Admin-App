"use client";

import { Shield } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInsurance } from "@/lib/actions/car";

export function InsuranceDialog({ vehicleId }: { vehicleId: string }) {
  return (
    <FormDialog
      title="Update insurance"
      submitLabel="Save"
      trigger={
        <Button type="button" variant="secondary" size="sm">
          <Shield />
          Insurance
        </Button>
      }
      onSubmit={(formData) => updateInsurance(vehicleId, formData)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider">Provider</Label>
        <Input id="provider" name="provider" placeholder="Admiral" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Annual price</Label>
          <Input id="price" name="price" type="number" step="0.01" placeholder="480" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="renewal_date">Renewal date</Label>
          <Input id="renewal_date" name="renewal_date" type="date" required />
        </div>
      </div>
    </FormDialog>
  );
}
