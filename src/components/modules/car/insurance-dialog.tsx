"use client";

import { Shield, Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editInsuranceRecord, updateInsurance } from "@/lib/actions/car";
import type { CarInsuranceRow } from "@/lib/types/database";

export function InsuranceDialog({
  vehicleId,
  record,
}: {
  vehicleId: string;
  record?: CarInsuranceRow;
}) {
  const isEdit = Boolean(record);

  return (
    <FormDialog
      title={isEdit ? "Edit insurance" : "Log insurance renewal"}
      submitLabel="Save"
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit insurance">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="secondary" size="sm">
            <Shield />
            Insurance
          </Button>
        )
      }
      onSubmit={(formData) =>
        isEdit ? editInsuranceRecord(record!.id, formData) : updateInsurance(vehicleId, formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider">Provider</Label>
        <Input id="provider" name="provider" placeholder="Admiral" defaultValue={record?.provider ?? undefined} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Annual price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            placeholder="480"
            defaultValue={record?.price ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="renewal_date">Renewal date</Label>
          <Input
            id="renewal_date"
            name="renewal_date"
            type="date"
            required
            defaultValue={record?.renewal_date}
          />
        </div>
      </div>
    </FormDialog>
  );
}
