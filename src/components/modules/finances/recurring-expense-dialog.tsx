"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRecurringExpense, updateRecurringExpense } from "@/lib/actions/finances";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/modules/finance-categories";
import type { FinanceRecurringExpenseRow } from "@/lib/types/database";

export function RecurringExpenseDialog({ expense }: { expense?: FinanceRecurringExpenseRow }) {
  const isEdit = Boolean(expense);

  return (
    <FormDialog
      title={isEdit ? "Edit monthly expense" : "Add monthly expense"}
      submitLabel={isEdit ? "Save changes" : "Add expense"}
      triggerLabel={isEdit ? undefined : "Add expense"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Edit expense">
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) =>
        isEdit ? updateRecurringExpense(expense!.id, formData) : createRecurringExpense(formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Spotify, Golf membership savings, Car insurance savings…"
          defaultValue={expense?.name}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={expense?.category ?? "subscription"}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_ORDER.map((category) => (
              <SelectItem key={category} value={category}>
                {CATEGORY_LABEL[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount per month</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          required
          placeholder="12.99"
          defaultValue={expense?.amount}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="e.g. which savings account this goes into"
          defaultValue={expense?.notes ?? undefined}
        />
      </div>
    </FormDialog>
  );
}
