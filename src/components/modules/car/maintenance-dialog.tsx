"use client";

import { Wrench } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMaintenanceEntry } from "@/lib/actions/car";

export function MaintenanceDialog({ vehicleId }: { vehicleId: string }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormDialog
      title="Log maintenance"
      submitLabel="Save"
      trigger={
        <Button type="button" variant="secondary" size="sm">
          <Wrench />
          Log maintenance
        </Button>
      }
      onSubmit={(formData) => createMaintenanceEntry(vehicleId, formData)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue="service">
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="tyre_change">Tyre change</SelectItem>
            <SelectItem value="repair">Repair</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="performed_on">Date</Label>
          <Input id="performed_on" name="performed_on" type="date" defaultValue={today} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cost">Cost</Label>
          <Input id="cost" name="cost" type="number" step="0.01" placeholder="120" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mileage">Mileage (optional)</Label>
        <Input id="mileage" name="mileage" type="number" placeholder="45000" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Front tyres replaced, brake fluid changed" />
      </div>
    </FormDialog>
  );
}
