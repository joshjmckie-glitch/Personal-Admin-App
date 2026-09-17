import { createClient } from "@/lib/supabase/server";
import { NewPaycheckDialog } from "@/components/modules/finances/new-paycheck-dialog";
import { PaycheckCard } from "@/components/modules/finances/paycheck-card";
import { PayVarianceAlert } from "@/components/modules/finances/pay-variance-alert";
import { SalaryBreakdownCard } from "@/components/modules/finances/salary-breakdown-card";
import { SavingsRateCard } from "@/components/modules/finances/savings-rate-card";
import { RecurringExpensesList } from "@/components/modules/finances/recurring-expenses-list";
import type { FinanceExpenseLogRow } from "@/lib/types/database";

export default async function FinancesPage() {
  const supabase = await createClient();

  const [{ data: paychecks }, { data: salarySettings }, { data: recurringExpenses }] = await Promise.all([
    supabase
      .from("finance_paychecks")
      .select("*")
      .order("pay_date", { ascending: false })
      .limit(24),
    supabase.from("finance_salary_settings").select("*").maybeSingle(),
    supabase.from("finance_recurring_expenses").select("*").order("created_at", { ascending: true }),
  ]);

  const expenseIds = (recurringExpenses ?? []).map((e) => e.id);
  let logsByExpense = new Map<string, FinanceExpenseLogRow[]>();
  if (expenseIds.length > 0) {
    const { data: logs } = await supabase
      .from("finance_expense_logs")
      .select("*")
      .in("expense_id", expenseIds)
      .order("logged_on", { ascending: false });
    logsByExpense = (logs ?? []).reduce((map, log) => {
      const list = map.get(log.expense_id) ?? [];
      list.push(log);
      map.set(log.expense_id, list);
      return map;
    }, new Map<string, FinanceExpenseLogRow[]>());
  }

  const recurringExpensesTotal = (recurringExpenses ?? [])
    .filter((e) => e.active)
    .reduce((sum, e) => sum + e.amount, 0);

  const latestPaycheck = paychecks?.[0] ?? null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold">Finances</h2>
        <p className="text-sm text-muted-foreground">Paychecks, monthly expenses & salary</p>
      </div>

      {latestPaycheck ? (
        <SavingsRateCard takeHome={latestPaycheck.net_amount} expenses={recurringExpensesTotal} />
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Paychecks</h3>
          <NewPaycheckDialog />
        </div>

        {!paychecks || paychecks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No paychecks logged yet. Add your first one to start tracking your breakdown.
          </p>
        ) : (
          <>
            <PayVarianceAlert paycheck={latestPaycheck!} salarySettings={salarySettings ?? null} />
            {paychecks.map((paycheck) => (
              <PaycheckCard
                key={paycheck.id}
                paycheck={paycheck}
                recurringExpensesTotal={recurringExpensesTotal}
                salarySettings={salarySettings ?? null}
              />
            ))}
          </>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Expenses</h3>
        <RecurringExpensesList expenses={recurringExpenses ?? []} logsByExpense={logsByExpense} />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Salary & Tax</h3>
        <SalaryBreakdownCard settings={salarySettings ?? null} />
      </section>
    </div>
  );
}
