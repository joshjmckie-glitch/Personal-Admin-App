"use client";

import { Plus, Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createExpenseLog, updateExpenseLog } from "@/lib/actions/finances";
import type { FinanceExpenseLogRow } from "@/lib/types/database";

export function ExpenseLogDialog({ expenseId, log }: { expenseId: string; log?: FinanceExpenseLogRow }) {
  const isEdit = Boolean(log);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <FormDialog
      title={isEdit ? "Edit fill-up" : "Log fill-up"}
      submitLabel="Save"
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit entry">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm">
            <Plus />
            Log fill-up
          </Button>
        )
      }
      onSubmit={(formData) =>
        isEdit ? updateExpenseLog(log!.id, expenseId, formData) : createExpenseLog(expenseId, formData)
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
          placeholder="58.20"
          defaultValue={log?.amount}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logged_on">Date</Label>
        <Input id="logged_on" name="logged_on" type="date" required defaultValue={log?.logged_on ?? today} />
      </div>
    </FormDialog>
  );
}
