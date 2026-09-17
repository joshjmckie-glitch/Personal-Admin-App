"use client";

import { useState } from "react";
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
import { cn, formatCurrency } from "@/lib/utils";
import type { FinanceRecurringExpenseRow } from "@/lib/types/database";

/** A billing day (1-31) as a same-month date string, for the date input's defaultValue. */
function billingDayToDate(day: number) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const clamped = Math.min(day, daysInMonth);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}

export function RecurringExpenseDialog({ expense }: { expense?: FinanceRecurringExpenseRow }) {
  const isEdit = Boolean(expense);
  const [isVariable, setIsVariable] = useState(expense?.is_variable ?? false);
  const [touchedVariable, setTouchedVariable] = useState(false);

  function handleCategoryChange(value: string) {
    // Fuel is almost always variable — suggest it, but only for a new
    // expense and only if the user hasn't already made their own choice.
    if (!isEdit && !touchedVariable && value === "fuel") {
      setIsVariable(true);
    }
  }

  function chooseVariable(value: boolean) {
    setIsVariable(value);
    setTouchedVariable(true);
  }

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
          placeholder="Spotify, Golf membership savings, Fuel…"
          defaultValue={expense?.name}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={expense?.category ?? "subscription"} onValueChange={handleCategoryChange}>
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
        <p className="text-xs text-muted-foreground">
          Categorising something as Fuel also shows it on the Car dashboard card.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Amount type</Label>
        <div className="inline-flex w-fit rounded-full border border-border p-0.5">
          <button
            type="button"
            onClick={() => chooseVariable(false)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              !isVariable ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            Fixed
          </button>
          <button
            type="button"
            onClick={() => chooseVariable(true)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              isVariable ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            Variable
          </button>
        </div>
        <input type="hidden" name="is_variable" value={isVariable ? "on" : ""} />
      </div>

      {!isVariable ? (
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
      ) : isEdit && expense ? (
        <p className="text-xs text-muted-foreground">
          Currently averaging {formatCurrency(expense.amount)} across logged months — log each month&rsquo;s
          actual amount from the expense row.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Estimated amount for this month</Label>
          <Input id="amount" name="amount" type="number" step="0.01" required placeholder="60" />
          <p className="text-xs text-muted-foreground">
            No fixed amount — this estimate becomes this month&rsquo;s figure, and each month after you log
            what it actually cost. The average updates automatically.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="billing_day">Billing day (optional)</Label>
        <Input
          id="billing_day"
          name="billing_day"
          type="date"
          defaultValue={expense?.billing_day ? billingDayToDate(expense.billing_day) : undefined}
        />
        <p className="text-xs text-muted-foreground">
          Pick any date — we&rsquo;ll just use the day of the month, to power the &ldquo;coming up&rdquo;
          countdown. Leave blank if it varies.
        </p>
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
