"use client";

import { PiggyBank, Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContribution, updateContribution } from "@/lib/actions/investments";
import type { InvestmentContributionRow } from "@/lib/types/database";

export function ContributionDialog({
  accountId,
  contribution,
}: {
  accountId: string;
  contribution?: InvestmentContributionRow;
}) {
  const isEdit = Boolean(contribution);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormDialog
      title={isEdit ? "Edit contribution" : "Log contribution"}
      submitLabel="Save"
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit contribution">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm">
            <PiggyBank />
            Log contribution
          </Button>
        )
      }
      onSubmit={(formData) =>
        isEdit ? updateContribution(contribution!.id, formData) : createContribution(accountId, formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          required
          placeholder="200"
          defaultValue={contribution?.amount}
        />
        <p className="text-xs text-muted-foreground">
          Enter a negative amount to log a withdrawal.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contributed_on">Date</Label>
        <Input
          id="contributed_on"
          name="contributed_on"
          type="date"
          required
          defaultValue={contribution?.contributed_on ?? today}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" name="notes" placeholder="Monthly top-up" defaultValue={contribution?.notes ?? undefined} />
      </div>
    </FormDialog>
  );
}
