import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SalarySettingsDialog } from "@/components/modules/finances/salary-settings-dialog";
import { estimateTakeHome, TAX_YEAR_LABEL } from "@/lib/tax/uk-tax";
import { formatCurrency } from "@/lib/utils";
import type { FinanceSalarySettingsRow } from "@/lib/types/database";

const PENSION_LABEL: Record<string, string> = {
  none: "None",
  salary_sacrifice: "Salary sacrifice",
  personal: "Personal / relief-at-source",
};

export function SalaryBreakdownCard({ settings }: { settings: FinanceSalarySettingsRow | null }) {
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

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            {formatCurrency(result.takeHomeMonthly)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">/ month expected</span>
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
