import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function SavingsRateCard({ takeHome, expenses }: { takeHome: number; expenses: number }) {
  if (takeHome <= 0) return null;

  const kept = takeHome - expenses;
  const rate = Math.round((kept / takeHome) * 100);
  const expensesPct = Math.min(100, Math.max(0, (expenses / takeHome) * 100));

  return (
    <Card>
      <CardContent>
        <div className="mb-1 flex items-baseline justify-between">
          <p className="text-sm font-semibold text-muted-foreground">Savings rate this month</p>
          <p className="text-3xl font-bold tracking-tight">{rate}%</p>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          {formatCurrency(kept)} kept after fixed monthly outgoings
        </p>
        <div className="mb-2 flex h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="bg-primary" style={{ width: `${100 - expensesPct}%` }} />
          <div className="bg-muted-foreground/40" style={{ width: `${expensesPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Take-home <span className="font-medium text-foreground">{formatCurrency(takeHome)}</span>
          </span>
          <span>
            Expenses <span className="font-medium text-foreground">{formatCurrency(expenses)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
