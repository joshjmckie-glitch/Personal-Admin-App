"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaycheck, updatePaycheck } from "@/lib/actions/finances";
import type { FinancePaycheckRow } from "@/lib/types/database";

export function NewPaycheckDialog({ paycheck }: { paycheck?: FinancePaycheckRow }) {
  const isEdit = Boolean(paycheck);

  return (
    <FormDialog
      title={isEdit ? "Edit paycheck" : "Add paycheck"}
      submitLabel={isEdit ? "Save changes" : "Add paycheck"}
      triggerLabel={isEdit ? undefined : "Add paycheck"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Edit paycheck">
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) =>
        isEdit ? updatePaycheck(paycheck!.id, formData) : createPaycheck(formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pay_date">Pay date</Label>
        <Input
          id="pay_date"
          name="pay_date"
          type="date"
          required
          defaultValue={paycheck?.pay_date}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="net_amount">Net amount</Label>
          <Input
            id="net_amount"
            name="net_amount"
            type="number"
            step="0.01"
            required
            placeholder="2400.00"
            defaultValue={paycheck?.net_amount}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gross_amount">Gross amount (optional)</Label>
          <Input
            id="gross_amount"
            name="gross_amount"
            type="number"
            step="0.01"
            placeholder="3200.00"
            defaultValue={paycheck?.gross_amount ?? undefined}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="overtime_amount">Overtime / extra this period (optional)</Label>
        <Input
          id="overtime_amount"
          name="overtime_amount"
          type="number"
          step="0.01"
          placeholder="150.00"
          defaultValue={paycheck?.overtime_amount ?? undefined}
        />
        <p className="text-xs text-muted-foreground">
          Extra gross pay on top of your usual salary this period — used to adjust your expected
          take-home for comparison.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="employer">Employer (optional)</Label>
        <Input id="employer" name="employer" placeholder="Acme Ltd" defaultValue={paycheck?.employer ?? undefined} />
      </div>
    </FormDialog>
  );
}
