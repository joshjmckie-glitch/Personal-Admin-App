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

export function RecurringExpenseDialog({ expense }: { expense?: FinanceRecurringExpenseRow }) {
  const isEdit = Boolean(expense);
  const [isVariable, setIsVariable] = useState(expense?.is_variable ?? false);

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
        <Label>Amount type</Label>
        <div className="inline-flex w-fit rounded-full border border-border p-0.5">
          <button
            type="button"
            onClick={() => setIsVariable(false)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              !isVariable ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            Fixed
          </button>
          <button
            type="button"
            onClick={() => setIsVariable(true)}
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
      ) : (
        <p className="text-xs text-muted-foreground">
          {isEdit && expense
            ? `Currently averaging ${formatCurrency(expense.amount)} from logged entries — log amounts from the expense row.`
            : "No fixed amount — you'll log what it actually costs each time, and the average becomes the monthly figure automatically."}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="billing_day">Billing day (optional)</Label>
        <Input
          id="billing_day"
          name="billing_day"
          type="number"
          min={1}
          max={31}
          placeholder="e.g. 1"
          defaultValue={expense?.billing_day ?? undefined}
        />
        <p className="text-xs text-muted-foreground">
          Day of the month this comes out, if it has one — powers the &ldquo;coming up&rdquo; countdown.
          Leave blank if it varies.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="show_on_car_widget"
          defaultChecked={expense?.show_on_car_widget ?? false}
          className="size-4 rounded border-input accent-primary"
        />
        Also show on the car dashboard card
      </label>

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
