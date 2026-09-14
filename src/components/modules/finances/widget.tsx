import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function FinancesWidget() {
  const supabase = await createClient();

  const { data: paycheck } = await supabase
    .from("finance_paychecks")
    .select("*")
    .order("pay_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!paycheck) {
    return <WidgetEmpty text="No paychecks logged yet" />;
  }

  const { data: items } = await supabase
    .from("finance_line_items")
    .select("category, amount")
    .eq("paycheck_id", paycheck.id);

  const allocated = (items ?? []).reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      <p className="text-xl font-semibold">{formatCurrency(paycheck.net_amount)}</p>
      <p className="text-xs text-muted-foreground">
        Last pay {formatDate(paycheck.pay_date)} · {formatCurrency(allocated)} allocated
      </p>
    </div>
  );
}
