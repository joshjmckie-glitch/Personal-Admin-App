import { createClient } from "@/lib/supabase/server";
import { NewAccountDialog } from "@/components/modules/investments/new-account-dialog";
import { AccountCard } from "@/components/modules/investments/account-card";
import { SummaryCard } from "@/components/modules/investments/summary-card";
import { CollapsibleGroup } from "@/components/modules/collapsible-group";
import { buildNetWorthSeries } from "@/lib/modules/net-worth-series";
import {
  DEFAULT_PROVIDER_SUGGESTIONS,
  DEFAULT_ACCOUNT_TYPE_SUGGESTIONS,
  mergeSuggestions,
} from "@/lib/modules/investment-suggestions";
import type {
  InvestmentConnectionRow,
  InvestmentContributionRow,
  InvestmentHoldingRow,
  InvestmentValueHistoryRow,
} from "@/lib/types/database";

export default async function InvestmentsPage() {
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("investment_accounts")
    .select("*")
    .order("created_at", { ascending: true });

  const accountIds = (accounts ?? []).map((a) => a.id);

  let historyByAccount = new Map<string, InvestmentValueHistoryRow[]>();
  let contributionsByAccount = new Map<string, InvestmentContributionRow[]>();
  let holdingsByAccount = new Map<string, InvestmentHoldingRow[]>();
  let connectionByAccount = new Map<string, InvestmentConnectionRow>();
  let allHistory: InvestmentValueHistoryRow[] = [];

  if (accountIds.length > 0) {
    const [{ data: history }, { data: contributions }, { data: holdings }, { data: connections }] =
      await Promise.all([
        supabase
          .from("investment_value_history")
          .select("*")
          .in("account_id", accountIds)
          .order("recorded_at", { ascending: true }),
        supabase
          .from("investment_contributions")
          .select("*")
          .in("account_id", accountIds)
          .order("contributed_on", { ascending: true }),
        supabase.from("investment_holdings").select("*").in("account_id", accountIds).order("value", {
          ascending: false,
        }),
        supabase.from("investment_connections").select("*").in("account_id", accountIds),
      ]);

    allHistory = history ?? [];
    historyByAccount = allHistory.reduce((map, h) => {
      const list = map.get(h.account_id) ?? [];
      list.push(h);
      map.set(h.account_id, list);
      return map;
    }, new Map<string, InvestmentValueHistoryRow[]>());

    contributionsByAccount = (contributions ?? []).reduce((map, c) => {
      const list = map.get(c.account_id) ?? [];
      list.push(c);
      map.set(c.account_id, list);
      return map;
    }, new Map<string, InvestmentContributionRow[]>());

    holdingsByAccount = (holdings ?? []).reduce((map, h) => {
      const list = map.get(h.account_id) ?? [];
      list.push(h);
      map.set(h.account_id, list);
      return map;
    }, new Map<string, InvestmentHoldingRow[]>());

    connectionByAccount = (connections ?? []).reduce((map, c) => {
      map.set(c.account_id, c);
      return map;
    }, new Map<string, InvestmentConnectionRow>());
  }

  const activeAccounts = (accounts ?? []).filter((a) => !a.archived);
  const archivedAccounts = (accounts ?? []).filter((a) => a.archived);

  const total = activeAccounts.reduce((sum, a) => sum + a.current_value, 0);

  const allocationMap = new Map<string, number>();
  for (const account of activeAccounts) {
    allocationMap.set(
      account.account_type,
      (allocationMap.get(account.account_type) ?? 0) + account.current_value
    );
  }
  const allocation = [...allocationMap.entries()].map(([label, value]) => ({ label, value }));

  const netWorthSeries = buildNetWorthSeries(
    activeAccounts.map((a) => a.id),
    allHistory.map((h) => ({ accountId: h.account_id, value: h.value, recordedAt: h.recorded_at }))
  );

  const providerSuggestions = mergeSuggestions(
    (accounts ?? []).map((a) => a.provider),
    DEFAULT_PROVIDER_SUGGESTIONS
  );
  const typeSuggestions = mergeSuggestions(
    (accounts ?? []).map((a) => a.account_type),
    DEFAULT_ACCOUNT_TYPE_SUGGESTIONS
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Investments</h2>
          <p className="text-sm text-muted-foreground">Accounts, contributions & holdings</p>
        </div>
        <NewAccountDialog providerSuggestions={providerSuggestions} typeSuggestions={typeSuggestions} />
      </div>

      {!accounts || accounts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No accounts yet. Add a savings account, ISA, or brokerage to start tracking.
        </p>
      ) : (
        <>
          {activeAccounts.length > 0 ? (
            <SummaryCard
              total={total}
              accountCount={activeAccounts.length}
              allocation={allocation}
              netWorthSeries={netWorthSeries}
            />
          ) : null}

          {activeAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              history={historyByAccount.get(account.id) ?? []}
              contributions={contributionsByAccount.get(account.id) ?? []}
              holdings={holdingsByAccount.get(account.id) ?? []}
              connection={connectionByAccount.get(account.id) ?? null}
              providerSuggestions={providerSuggestions}
              typeSuggestions={typeSuggestions}
            />
          ))}

          {archivedAccounts.length > 0 ? (
            <div className="rounded-xl border border-border/60 bg-card px-4">
              <CollapsibleGroup label="Archived accounts" count={archivedAccounts.length}>
                <div className="flex flex-col gap-4 pt-2">
                  {archivedAccounts.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      history={historyByAccount.get(account.id) ?? []}
                      contributions={contributionsByAccount.get(account.id) ?? []}
                      holdings={holdingsByAccount.get(account.id) ?? []}
                      connection={connectionByAccount.get(account.id) ?? null}
                      providerSuggestions={providerSuggestions}
                      typeSuggestions={typeSuggestions}
                    />
                  ))}
                </div>
              </CollapsibleGroup>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
