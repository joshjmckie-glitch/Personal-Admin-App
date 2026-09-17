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
  const thisMonth = new Date().toISOString().slice(0, 7);

  return (
    <FormDialog
      title={isEdit ? "Edit monthly amount" : "Log this month's amount"}
      submitLabel="Save"
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit entry">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm">
            <Plus />
            Log this month&rsquo;s amount
          </Button>
        )
      }
      onSubmit={(formData) =>
        isEdit ? updateExpenseLog(log!.id, expenseId, formData) : createExpenseLog(expenseId, formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logged_month">Month</Label>
        <Input
          id="logged_month"
          name="logged_month"
          type="month"
          required
          defaultValue={log?.logged_month.slice(0, 7) ?? thisMonth}
        />
        <p className="text-xs text-muted-foreground">
          Logging a month you&rsquo;ve already added updates that month&rsquo;s figure instead of adding another.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          required
          placeholder="220"
          defaultValue={log?.amount}
        />
      </div>
    </FormDialog>
  );
}
