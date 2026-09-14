import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";
import { formatCurrency } from "@/lib/utils";

export async function InvestmentsWidget() {
  const supabase = await createClient();

  const { data: accounts } = await supabase.from("investment_accounts").select("current_value, currency");

  if (!accounts || accounts.length === 0) {
    return <WidgetEmpty text="No accounts yet" />;
  }

  const total = accounts.filter((a) => a.currency === "GBP").reduce((sum, a) => sum + a.current_value, 0);

  return (
    <div>
      <p className="text-xl font-semibold">{formatCurrency(total)}</p>
      <p className="text-xs text-muted-foreground">
        Across {accounts.length} account{accounts.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
