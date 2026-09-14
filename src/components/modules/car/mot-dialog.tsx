"use client";

import { ClipboardCheck } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMot } from "@/lib/actions/car";

export function MotDialog({ vehicleId }: { vehicleId: string }) {
  return (
    <FormDialog
      title="Update MOT"
      submitLabel="Save"
      trigger={
        <Button type="button" variant="secondary" size="sm">
          <ClipboardCheck />
          MOT
        </Button>
      }
      onSubmit={(formData) => updateMot(vehicleId, formData)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="due_date">Next MOT due</Label>
        <Input id="due_date" name="due_date" type="date" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="last_pass_date">Last pass date (optional)</Label>
        <Input id="last_pass_date" name="last_pass_date" type="date" />
      </div>
    </FormDialog>
  );
}
