"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { NewLineItemDialog } from "@/components/modules/finances/new-line-item-dialog";
import { NewPaycheckDialog } from "@/components/modules/finances/new-paycheck-dialog";
import { LineItemRow } from "@/components/modules/finances/line-item-row";
import { deletePaycheck } from "@/lib/actions/finances";
import { estimateMonthlyTakeHomeWithExtra } from "@/lib/tax/uk-tax";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  FinanceLineItemRow,
  FinancePaycheckRow,
  FinanceSalarySettingsRow,
} from "@/lib/types/database";

export function PaycheckCard({
  paycheck,
  items,
  salarySettings,
}: {
  paycheck: FinancePaycheckRow;
  items: FinanceLineItemRow[];
  salarySettings: FinanceSalarySettingsRow | null;
}) {
  const allocated = items.reduce((sum, item) => sum + item.amount, 0);
  const remaining = paycheck.net_amount - allocated;
  const pct = paycheck.net_amount > 0 ? Math.min(100, (allocated / paycheck.net_amount) * 100) : 0;

  const expected = salarySettings
    ? estimateMonthlyTakeHomeWithExtra(
        {
          annualSalary: salarySettings.annual_salary,
          pensionPercent: salarySettings.pension_percent,
          pensionType: salarySettings.pension_type,
        },
        paycheck.overtime_amount ?? 0
      )
    : null;
  const expectedDiff = expected ? paycheck.net_amount - expected.takeHomeMonthly : null;

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
            {paycheck.overtime_amount ? ` · +${formatCurrency(paycheck.overtime_amount)} extra` : ""}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <NewPaycheckDialog paycheck={paycheck} />
          <DeleteButton onDelete={() => deletePaycheck(paycheck.id)} label="Delete paycheck" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {expected ? (
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-2.5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="font-medium">{formatCurrency(expected.takeHomeMonthly)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Actual</p>
              <p className="font-medium">{formatCurrency(paycheck.net_amount)}</p>
            </div>
            {expectedDiff !== null ? (
              <Badge variant={Math.abs(expectedDiff) < 1 ? "success" : expectedDiff > 0 ? "success" : "destructive"}>
                {expectedDiff >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(expectedDiff))}
              </Badge>
            ) : null}
          </div>
        ) : null}

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
