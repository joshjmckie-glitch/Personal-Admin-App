"use client";

import { ClipboardCheck, Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editMotRecord, updateMot } from "@/lib/actions/car";
import type { CarMotRow } from "@/lib/types/database";

export function MotDialog({ vehicleId, record }: { vehicleId: string; record?: CarMotRow }) {
  const isEdit = Boolean(record);

  return (
    <FormDialog
      title={isEdit ? "Edit MOT" : "Log MOT"}
      submitLabel="Save"
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit MOT">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="secondary" size="sm">
            <ClipboardCheck />
            MOT
          </Button>
        )
      }
      onSubmit={(formData) => (isEdit ? editMotRecord(record!.id, formData) : updateMot(vehicleId, formData))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="due_date">Next MOT due</Label>
        <Input id="due_date" name="due_date" type="date" required defaultValue={record?.due_date} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="last_pass_date">Last pass date (optional)</Label>
        <Input
          id="last_pass_date"
          name="last_pass_date"
          type="date"
          defaultValue={record?.last_pass_date ?? undefined}
        />
      </div>
    </FormDialog>
  );
}
