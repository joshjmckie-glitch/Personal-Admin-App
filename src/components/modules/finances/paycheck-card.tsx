"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DeleteButton } from "@/components/modules/delete-button";
import { NewLineItemDialog } from "@/components/modules/finances/new-line-item-dialog";
import { LineItemRow } from "@/components/modules/finances/line-item-row";
import { deletePaycheck } from "@/lib/actions/finances";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FinanceLineItemRow, FinancePaycheckRow } from "@/lib/types/database";

export function PaycheckCard({
  paycheck,
  items,
}: {
  paycheck: FinancePaycheckRow;
  items: FinanceLineItemRow[];
}) {
  const allocated = items.reduce((sum, item) => sum + item.amount, 0);
  const remaining = paycheck.net_amount - allocated;
  const pct = paycheck.net_amount > 0 ? Math.min(100, (allocated / paycheck.net_amount) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            {formatCurrency(paycheck.net_amount)}
          </CardTitle>
          <CardDescription>
            {formatDate(paycheck.pay_date)}
            {paycheck.employer ? ` · ${paycheck.employer}` : ""}
          </CardDescription>
        </div>
        <DeleteButton onDelete={() => deletePaycheck(paycheck.id)} label="Delete paycheck" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Allocated {formatCurrency(allocated)}</span>
            <span>
              {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(-remaining)} over`}
            </span>
          </div>
          <Progress value={pct} indicatorClassName={remaining < 0 ? "bg-destructive" : undefined} />
        </div>

        <div>
          {items.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No line items yet.</p>
          ) : (
            items.map((item) => <LineItemRow key={item.id} item={item} />)
          )}
        </div>

        <NewLineItemDialog paycheckId={paycheck.id} />
      </CardContent>
    </Card>
  );
}
