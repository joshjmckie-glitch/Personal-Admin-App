"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaycheck } from "@/lib/actions/finances";

export function NewPaycheckDialog() {
  return (
    <FormDialog
      title="Add paycheck"
      triggerLabel="Add paycheck"
      submitLabel="Add paycheck"
      onSubmit={createPaycheck}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pay_date">Pay date</Label>
        <Input id="pay_date" name="pay_date" type="date" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="net_amount">Net amount</Label>
        <Input id="net_amount" name="net_amount" type="number" step="0.01" required placeholder="2400.00" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gross_amount">Gross amount (optional)</Label>
        <Input id="gross_amount" name="gross_amount" type="number" step="0.01" placeholder="3200.00" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="employer">Employer (optional)</Label>
        <Input id="employer" name="employer" placeholder="Acme Ltd" />
      </div>
    </FormDialog>
  );
}
