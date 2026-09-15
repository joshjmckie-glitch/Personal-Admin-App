import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";
import { estimateMonthlyTakeHomeWithExtra } from "@/lib/tax/uk-tax";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function FinancesWidget() {
  const supabase = await createClient();

  const [{ data: paycheck }, { data: salarySettings }] = await Promise.all([
    supabase
      .from("finance_paychecks")
      .select("*")
      .order("pay_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("finance_salary_settings").select("*").maybeSingle(),
  ]);

  if (!paycheck) {
    return <WidgetEmpty text="No paychecks logged yet" />;
  }

  if (salarySettings) {
    const expected = estimateMonthlyTakeHomeWithExtra(
      {
        annualSalary: salarySettings.annual_salary,
        pensionPercent: salarySettings.pension_percent,
        pensionType: salarySettings.pension_type,
      },
      paycheck.overtime_amount ?? 0
    );
    const diff = paycheck.net_amount - expected.takeHomeMonthly;

    return (
      <div>
        <p className="text-xl font-semibold">{formatCurrency(paycheck.net_amount)}</p>
        <p className="text-xs text-muted-foreground">
          Expected {formatCurrency(expected.takeHomeMonthly)} ·{" "}
          {diff >= 0 ? "+" : "-"}
          {formatCurrency(Math.abs(diff))} vs plan
        </p>
      </div>
    );
  }

  const { data: expenses } = await supabase
    .from("finance_recurring_expenses")
    .select("amount, active")
    .eq("active", true);

  const allocated = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <p className="text-xl font-semibold">{formatCurrency(paycheck.net_amount)}</p>
      <p className="text-xs text-muted-foreground">
        Last pay {formatDate(paycheck.pay_date)} · {formatCurrency(allocated)} recurring/month
      </p>
    </div>
  );
}
