import Link from "next/link";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FinanceRecurringExpenseRow } from "@/lib/types/database";

export function FuelSummaryCard({
  expenses,
  logCountByExpense,
}: {
  expenses: FinanceRecurringExpenseRow[];
  logCountByExpense: Map<string, number>;
}) {
  if (expenses.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-foreground">Fuel</CardTitle>
          <CardDescription>
            From your <Link href="/finances" className="underline underline-offset-2">Finances</Link> expenses
            categorised as Fuel
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between text-sm">
            <span>{expense.name}</span>
            <span className="text-right">
              <span className="font-semibold">
                {expense.is_variable ? "~" : ""}
                {formatCurrency(expense.amount)}/mo
              </span>
              {expense.is_variable ? (
                <span className="block text-xs text-muted-foreground">
                  {logCountByExpense.get(expense.id) ?? 0} months logged
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
