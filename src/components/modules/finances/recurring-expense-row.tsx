"use client";

import { useTransition } from "react";

import { Switch } from "@/components/ui/switch";
import { CollapsibleGroup } from "@/components/modules/collapsible-group";
import { DeleteButton } from "@/components/modules/delete-button";
import { ExpenseLogDialog } from "@/components/modules/finances/expense-log-dialog";
import { ExpenseLogRow } from "@/components/modules/finances/expense-log-row";
import { RecurringExpenseDialog } from "@/components/modules/finances/recurring-expense-dialog";
import { deleteRecurringExpense, toggleRecurringExpenseActive } from "@/lib/actions/finances";
import { cn, formatCurrency } from "@/lib/utils";
import type { FinanceExpenseLogRow, FinanceRecurringExpenseRow } from "@/lib/types/database";

export function RecurringExpenseRow({
  expense,
  logs,
}: {
  expense: FinanceRecurringExpenseRow;
  logs: FinanceExpenseLogRow[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="border-b border-border/50 py-2.5 last:border-b-0">
      <div className="flex items-center gap-3">
        <Switch
          checked={expense.active}
          disabled={pending}
          onCheckedChange={(checked) =>
            startTransition(() => toggleRecurringExpenseActive(expense.id, checked))
          }
          aria-label={expense.active ? "Active" : "Paused"}
        />
        <div className="min-w-0 flex-1">
          <span className={cn("truncate text-sm", !expense.active && "text-muted-foreground line-through")}>
            {expense.name}
          </span>
          {expense.notes ? <p className="text-xs text-muted-foreground">{expense.notes}</p> : null}
        </div>
        {expense.is_variable ? (
          <span className="text-right text-sm font-medium">
            ~{formatCurrency(expense.amount)}
            <span className="block text-xs font-normal text-muted-foreground">{logs.length} months logged</span>
          </span>
        ) : (
          <span className="text-sm font-medium">{formatCurrency(expense.amount)}</span>
        )}
        <RecurringExpenseDialog expense={expense} />
        <DeleteButton onDelete={() => deleteRecurringExpense(expense.id)} label="Delete expense" />
      </div>

      {expense.is_variable ? (
        <div className="pl-11">
          {logs.length > 0 ? (
            <CollapsibleGroup label="Monthly amounts" count={logs.length}>
              {logs.map((log) => (
                <ExpenseLogRow key={log.id} expenseId={expense.id} log={log} />
              ))}
            </CollapsibleGroup>
          ) : null}
          <ExpenseLogDialog expenseId={expense.id} />
        </div>
      ) : null}
    </div>
  );
}
