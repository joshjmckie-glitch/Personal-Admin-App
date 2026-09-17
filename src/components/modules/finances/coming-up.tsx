import { Card, CardContent } from "@/components/ui/card";
import { DueBadge } from "@/components/modules/finances/due-badge";
import { CATEGORY_LABEL } from "@/lib/modules/finance-categories";
import { nextOccurrence } from "@/lib/modules/recurring-expense-schedule";
import { daysUntil, formatCurrency } from "@/lib/utils";
import type { FinanceRecurringExpenseRow } from "@/lib/types/database";

export function ComingUpExpenses({ expenses }: { expenses: FinanceRecurringExpenseRow[] }) {
  const scheduled = expenses
    .filter((e) => e.active && e.billing_day != null)
    .map((e) => {
      const due = nextOccurrence(e.billing_day!);
      return { expense: e, days: daysUntil(due) };
    })
    .sort((a, b) => a.days - b.days);

  if (scheduled.length === 0) return null;

  return (
    <Card>
      <CardContent className="flex flex-col">
        {scheduled.map(({ expense, days }) => (
          <div
            key={expense.id}
            className="flex items-center gap-3 border-b border-border/50 py-2.5 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{expense.name}</p>
              <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[expense.category]}</p>
            </div>
            <span className="text-sm font-medium">{formatCurrency(expense.amount)}</span>
            <DueBadge days={days} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
