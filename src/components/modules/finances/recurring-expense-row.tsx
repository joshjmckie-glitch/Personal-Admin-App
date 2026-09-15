"use client";

import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DeleteButton } from "@/components/modules/delete-button";
import { RecurringExpenseDialog } from "@/components/modules/finances/recurring-expense-dialog";
import { deleteRecurringExpense, toggleRecurringExpenseActive } from "@/lib/actions/finances";
import { cn, formatCurrency } from "@/lib/utils";
import type { FinanceRecurringExpenseRow } from "@/lib/types/database";

const CATEGORY_LABEL: Record<string, string> = {
  subscription: "Subscription",
  savings: "Savings",
  rent: "Rent",
  bills: "Bills",
  other: "Other",
};

export function RecurringExpenseRow({ expense }: { expense: FinanceRecurringExpenseRow }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 border-b border-border/50 py-2.5 last:border-b-0">
      <Switch
        checked={expense.active}
        disabled={pending}
        onCheckedChange={(checked) =>
          startTransition(() => toggleRecurringExpenseActive(expense.id, checked))
        }
        aria-label={expense.active ? "Active" : "Paused"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("truncate text-sm", !expense.active && "text-muted-foreground line-through")}>
            {expense.name}
          </span>
          <Badge variant="outline">{CATEGORY_LABEL[expense.category]}</Badge>
        </div>
        {expense.notes ? <p className="text-xs text-muted-foreground">{expense.notes}</p> : null}
      </div>
      <span className="text-sm font-medium">{formatCurrency(expense.amount)}</span>
      <RecurringExpenseDialog expense={expense} />
      <DeleteButton onDelete={() => deleteRecurringExpense(expense.id)} label="Delete expense" />
    </div>
  );
}
