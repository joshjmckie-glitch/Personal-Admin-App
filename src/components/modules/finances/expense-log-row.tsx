"use client";

import { DeleteButton } from "@/components/modules/delete-button";
import { ExpenseLogDialog } from "@/components/modules/finances/expense-log-dialog";
import { deleteExpenseLog } from "@/lib/actions/finances";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FinanceExpenseLogRow } from "@/lib/types/database";

export function ExpenseLogRow({ expenseId, log }: { expenseId: string; log: FinanceExpenseLogRow }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 last:border-b-0">
      <p className="text-sm">{formatDate(log.logged_on)}</p>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{formatCurrency(log.amount)}</span>
        <ExpenseLogDialog expenseId={expenseId} log={log} />
        <DeleteButton onDelete={() => deleteExpenseLog(log.id, expenseId)} label="Delete entry" />
      </div>
    </div>
  );
}
