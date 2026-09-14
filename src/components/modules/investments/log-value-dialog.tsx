"use client";

import { TrendingUp } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logValue } from "@/lib/actions/investments";

export function LogValueDialog({ accountId }: { accountId: string }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormDialog
      title="Log new value"
      submitLabel="Save"
      trigger={
        <Button type="button" variant="ghost" size="sm">
          <TrendingUp />
          Log value
        </Button>
      }
      onSubmit={(formData) => logValue(accountId, formData)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="value">Value</Label>
        <Input id="value" name="value" type="number" step="0.01" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recorded_at">Date</Label>
        <Input id="recorded_at" name="recorded_at" type="date" defaultValue={today} required />
      </div>
    </FormDialog>
  );
}
