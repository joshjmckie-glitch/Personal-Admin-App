import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewPaycheckDialog } from "@/components/modules/finances/new-paycheck-dialog";
import { PaycheckCard } from "@/components/modules/finances/paycheck-card";
import { SalaryBreakdownCard } from "@/components/modules/finances/salary-breakdown-card";
import { RecurringExpensesList } from "@/components/modules/finances/recurring-expenses-list";

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

  const recurringExpensesTotal = (recurringExpenses ?? [])
    .filter((e) => e.active)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Finances</h2>
        <p className="text-sm text-muted-foreground">Paychecks, monthly expenses & salary</p>
      </div>

      <Tabs defaultValue="paychecks">
        <TabsList>
          <TabsTrigger value="paychecks">Paychecks</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="salary">Salary & Tax</TabsTrigger>
        </TabsList>

        <TabsContent value="paychecks" className="flex flex-col gap-4">
          <div className="flex justify-end">
            <NewPaycheckDialog />
          </div>

          {!paychecks || paychecks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No paychecks logged yet. Add your first one to start tracking your breakdown.
            </p>
          ) : (
            paychecks.map((paycheck) => (
              <PaycheckCard
                key={paycheck.id}
                paycheck={paycheck}
                recurringExpensesTotal={recurringExpensesTotal}
                salarySettings={salarySettings ?? null}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="expenses">
          <RecurringExpensesList expenses={recurringExpenses ?? []} />
        </TabsContent>

        <TabsContent value="salary">
          <SalaryBreakdownCard settings={salarySettings ?? null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
