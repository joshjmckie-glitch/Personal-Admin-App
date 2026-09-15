import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewPaycheckDialog } from "@/components/modules/finances/new-paycheck-dialog";
import { PaycheckCard } from "@/components/modules/finances/paycheck-card";
import { SalaryBreakdownCard } from "@/components/modules/finances/salary-breakdown-card";
import type { FinanceLineItemRow } from "@/lib/types/database";

export default async function FinancesPage() {
  const supabase = await createClient();

  const [{ data: paychecks }, { data: salarySettings }] = await Promise.all([
    supabase
      .from("finance_paychecks")
      .select("*")
      .order("pay_date", { ascending: false })
      .limit(24),
    supabase.from("finance_salary_settings").select("*").maybeSingle(),
  ]);

  const paycheckIds = (paychecks ?? []).map((p) => p.id);
  let itemsByPaycheck = new Map<string, FinanceLineItemRow[]>();

  if (paycheckIds.length > 0) {
    const { data: items } = await supabase
      .from("finance_line_items")
      .select("*")
      .in("paycheck_id", paycheckIds)
      .order("created_at", { ascending: true });

    itemsByPaycheck = (items ?? []).reduce((map, item) => {
      const list = map.get(item.paycheck_id) ?? [];
      list.push(item);
      map.set(item.paycheck_id, list);
      return map;
    }, new Map<string, FinanceLineItemRow[]>());
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Finances</h2>
        <p className="text-sm text-muted-foreground">Per-paycheck breakdown</p>
      </div>

      <Tabs defaultValue="paychecks">
        <TabsList>
          <TabsTrigger value="paychecks">Paychecks</TabsTrigger>
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
                items={itemsByPaycheck.get(paycheck.id) ?? []}
                salarySettings={salarySettings ?? null}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="salary">
          <SalaryBreakdownCard settings={salarySettings ?? null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
