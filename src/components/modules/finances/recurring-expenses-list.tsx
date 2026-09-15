import { Card, CardContent } from "@/components/ui/card";
import { RecurringExpenseDialog } from "@/components/modules/finances/recurring-expense-dialog";
import { RecurringExpenseRow } from "@/components/modules/finances/recurring-expense-row";
import { formatCurrency } from "@/lib/utils";
import type { FinanceRecurringExpenseRow } from "@/lib/types/database";

export function RecurringExpensesList({ expenses }: { expenses: FinanceRecurringExpenseRow[] }) {
  const active = expenses.filter((e) => e.active);
  const total = active.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Total: {formatCurrency(total)} / month</p>
          <p className="text-xs text-muted-foreground">
            {active.length} active{expenses.length > active.length ? ` · ${expenses.length - active.length} paused` : ""}
          </p>
        </div>
        <RecurringExpenseDialog />
      </div>

      <Card>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No recurring expenses yet. Add subscriptions and savings-pot transfers that come out
              every month — Spotify, golf membership, car insurance, holiday fund, etc.
            </p>
          ) : (
            expenses.map((expense) => <RecurringExpenseRow key={expense.id} expense={expense} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
