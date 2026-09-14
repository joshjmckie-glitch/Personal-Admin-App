import { createClient } from "@/lib/supabase/server";
import { NewAccountDialog } from "@/components/modules/investments/new-account-dialog";
import { AccountCard } from "@/components/modules/investments/account-card";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentValueHistoryRow } from "@/lib/types/database";

export default async function InvestmentsPage() {
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("investment_accounts")
    .select("*")
    .order("created_at", { ascending: true });

  const accountIds = (accounts ?? []).map((a) => a.id);
  let historyByAccount = new Map<string, InvestmentValueHistoryRow[]>();

  if (accountIds.length > 0) {
    const { data: history } = await supabase
      .from("investment_value_history")
      .select("*")
      .in("account_id", accountIds)
      .order("recorded_at", { ascending: true });

    historyByAccount = (history ?? []).reduce((map, h) => {
      const list = map.get(h.account_id) ?? [];
      list.push(h);
      map.set(h.account_id, list);
      return map;
    }, new Map<string, InvestmentValueHistoryRow[]>());
  }

  const total = (accounts ?? [])
    .filter((a) => a.currency === "GBP")
    .reduce((sum, a) => sum + a.current_value, 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Investments</h2>
          <p className="text-sm text-muted-foreground">
            Total {formatCurrency(total)} across {accounts?.length ?? 0} account(s)
          </p>
        </div>
        <NewAccountDialog />
      </div>

      {!accounts || accounts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No accounts yet. Add a savings account, ISA, or brokerage to start tracking.
        </p>
      ) : (
        accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            history={historyByAccount.get(account.id) ?? []}
          />
        ))
      )}
    </div>
  );
}
