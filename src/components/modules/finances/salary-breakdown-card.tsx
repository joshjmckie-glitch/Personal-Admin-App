import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SalarySettingsDialog } from "@/components/modules/finances/salary-settings-dialog";
import { estimateTakeHome, TAX_YEAR_LABEL } from "@/lib/tax/uk-tax";
import { fetchUkBankHolidays, nextPayDate } from "@/lib/modules/pay-day";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import type { FinanceSalarySettingsRow } from "@/lib/types/database";

const PENSION_LABEL: Record<string, string> = {
  none: "None",
  salary_sacrifice: "Salary sacrifice",
  personal: "Personal / relief-at-source",
};

/** Countdown badge for the next pay date — closer is good news, so this reads opposite to the bill-due badges. */
function PayDayBadge({ days }: { days: number }) {
  if (days === 0) return <Badge variant="success">Payday today</Badge>;
  if (days <= 3) return <Badge className="border-transparent bg-primary/20 text-primary">Payday in {days}d</Badge>;
  return <Badge variant="outline">Payday in {days}d</Badge>;
}

export async function SalaryBreakdownCard({ settings }: { settings: FinanceSalarySettingsRow | null }) {
  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Set up your salary
            </CardTitle>
            <CardDescription>
              Add your annual salary to see an estimated take-home breakdown and compare it
              against what actually lands each month.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SalarySettingsDialog settings={null} />
        </CardContent>
      </Card>
    );
  }

  const result = estimateTakeHome({
    annualSalary: settings.annual_salary,
    pensionPercent: settings.pension_percent,
    pensionType: settings.pension_type,
  });

  const rows: Array<[string, number, boolean?]> = [["Gross annual salary", result.grossAnnual]];
  if (result.pensionContributionAnnual > 0) {
    rows.push(["Pension contribution", -result.pensionContributionAnnual]);
  }
  rows.push(
    ["Personal allowance", result.personalAllowance],
    ["Income tax", -result.incomeTaxAnnual],
    ["National Insurance", -result.nationalInsuranceAnnual]
  );
  if (result.netPensionDeductionAnnual > 0) {
    rows.push(["Personal pension (from take-home)", -result.netPensionDeductionAnnual]);
  }
  rows.push(["Take-home (annual)", result.takeHomeAnnual, true]);

  let payDayInfo: { date: Date; days: number } | null = null;
  if (settings.pay_day) {
    const holidays = await fetchUkBankHolidays();
    const date = nextPayDate(settings.pay_day, holidays);
    payDayInfo = { date, days: daysUntil(date) };
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base font-semibold text-foreground">
            <span>
              {formatCurrency(result.takeHomeMonthly)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ month expected</span>
            </span>
            {payDayInfo ? (
              <span className="flex items-center gap-1.5">
                <PayDayBadge days={payDayInfo.days} />
                <span className="text-xs font-normal text-muted-foreground">
                  {formatDate(payDayInfo.date, { day: "numeric", month: "short" })}
                </span>
              </span>
            ) : null}
          </CardTitle>
          <CardDescription>
            {formatCurrency(settings.annual_salary)} salary · {settings.pension_percent}%{" "}
            {PENSION_LABEL[settings.pension_type]} pension
          </CardDescription>
        </div>
        <SalarySettingsDialog settings={settings} />
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {rows.map(([label, value, isTotal]) => (
          <div
            key={label}
            className={`flex items-center justify-between text-sm ${isTotal ? "border-t border-border/60 pt-2 font-medium" : "text-muted-foreground"}`}
          >
            <span>{label}</span>
            <span className={isTotal ? "text-foreground" : undefined}>
              {value < 0 ? "-" : ""}
              {formatCurrency(Math.abs(value))}
            </span>
          </div>
        ))}
        <p className="pt-2 text-xs text-muted-foreground">
          Estimate for {TAX_YEAR_LABEL}. Assumes a standard tax code and no student loan or other
          income — treat as a guide, not a payslip.
        </p>
      </CardContent>
    </Card>
  );
}
