"use client";

import { Receipt, Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editRoadTaxRecord, updateRoadTax } from "@/lib/actions/car";
import type { CarRoadTaxRow } from "@/lib/types/database";

export function RoadTaxDialog({ vehicleId, record }: { vehicleId: string; record?: CarRoadTaxRow }) {
  const isEdit = Boolean(record);

  return (
    <FormDialog
      title={isEdit ? "Edit road tax" : "Log road tax"}
      submitLabel="Save"
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit road tax">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="secondary" size="sm">
            <Receipt />
            Road tax
          </Button>
        )
      }
      onSubmit={(formData) =>
        isEdit ? editRoadTaxRecord(record!.id, formData) : updateRoadTax(vehicleId, formData)
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            placeholder="180"
            defaultValue={record?.price ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="due_date">Due date</Label>
          <Input id="due_date" name="due_date" type="date" required defaultValue={record?.due_date} />
        </div>
      </div>
    </FormDialog>
  );
}
