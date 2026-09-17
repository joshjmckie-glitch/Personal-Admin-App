import { TriangleAlert, CircleCheck } from "lucide-react";

import { estimateMonthlyTakeHomeWithExtra } from "@/lib/tax/uk-tax";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { FinancePaycheckRow, FinanceSalarySettingsRow } from "@/lib/types/database";

// Below this, a difference is just normal rounding/timing noise, not worth a proactive alert.
const THRESHOLD = 15;

export function PayVarianceAlert({
  paycheck,
  salarySettings,
}: {
  paycheck: FinancePaycheckRow;
  salarySettings: FinanceSalarySettingsRow | null;
}) {
  if (!salarySettings) return null;

  const expected = estimateMonthlyTakeHomeWithExtra(
    {
      annualSalary: salarySettings.annual_salary,
      pensionPercent: salarySettings.pension_percent,
      pensionType: salarySettings.pension_type,
    },
    paycheck.overtime_amount ?? 0
  );
  const diff = paycheck.net_amount - expected.takeHomeMonthly;
  if (Math.abs(diff) < THRESHOLD) return null;

  const isOver = diff > 0;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3.5",
        isOver ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isOver ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
        )}
      >
        {isOver ? <CircleCheck className="size-4" /> : <TriangleAlert className="size-4" />}
      </div>
      <div className="text-sm">
        <p className="font-semibold">{isOver ? "Above expected" : "Below expected"}</p>
        <p className="text-muted-foreground">
          Your payslip on <span className="font-medium text-foreground">{formatDate(paycheck.pay_date)}</span>{" "}
          came in{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(Math.abs(diff))} {isOver ? "over" : "under"}
          </span>{" "}
          what we expected
          {isOver
            ? " — likely the overtime you logged that month."
            : " — worth checking for a missed overtime entry or a pension change."}
        </p>
      </div>
    </div>
  );
}
