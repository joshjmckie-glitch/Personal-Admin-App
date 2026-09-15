"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { Archive, ArchiveRestore } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/modules/delete-button";
import { CollapsibleGroup } from "@/components/modules/collapsible-group";
import { LogValueDialog } from "@/components/modules/investments/log-value-dialog";
import { NewAccountDialog } from "@/components/modules/investments/new-account-dialog";
import { ContributionDialog } from "@/components/modules/investments/contribution-dialog";
import { ContributionRow } from "@/components/modules/investments/contribution-row";
import { HoldingDialog } from "@/components/modules/investments/holding-dialog";
import { HoldingRow } from "@/components/modules/investments/holding-row";
import { HoldingsPie } from "@/components/modules/investments/holdings-pie";
import { deleteAccount, setAccountArchived } from "@/lib/actions/investments";
import { formatCurrency } from "@/lib/utils";
import type {
  InvestmentAccountRow,
  InvestmentContributionRow,
  InvestmentHoldingRow,
  InvestmentValueHistoryRow,
} from "@/lib/types/database";

export function AccountCard({
  account,
  history,
  contributions,
  holdings,
  providerSuggestions,
  typeSuggestions,
}: {
  account: InvestmentAccountRow;
  history: InvestmentValueHistoryRow[];
  contributions: InvestmentContributionRow[];
  holdings: InvestmentHoldingRow[];
  providerSuggestions: string[];
  typeSuggestions: string[];
}) {
  const chartData = history.map((h) => ({ value: h.value }));
  const first = history[0]?.value ?? account.current_value;
  const change = account.current_value - first;
  const changePct = first !== 0 ? (change / first) * 100 : 0;

  const netContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
  const gain = account.current_value - netContributed;
  const gainPct = netContributed !== 0 ? (gain / netContributed) * 100 : null;

  const holdingsTotal = holdings.reduce((sum, h) => sum + h.value, 0);

  return (
    <Card className={account.archived ? "opacity-70" : undefined}>
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-foreground">{account.name}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge variant="outline">{account.provider}</Badge>
            <Badge variant="outline">{account.account_type}</Badge>
            {account.sync_mode !== "manual" ? (
              <Badge variant="success">Live sync</Badge>
            ) : (
              <Badge variant="secondary">Manual</Badge>
            )}
            {account.archived ? <Badge variant="secondary">Archived</Badge> : null}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <NewAccountDialog
            account={account}
            providerSuggestions={providerSuggestions}
            typeSuggestions={typeSuggestions}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={account.archived ? "Unarchive account" : "Archive account"}
            onClick={() => setAccountArchived(account.id, !account.archived)}
          >
            {account.archived ? (
              <ArchiveRestore className="size-4 text-muted-foreground" />
            ) : (
              <Archive className="size-4 text-muted-foreground" />
            )}
          </Button>
          <DeleteButton onDelete={() => deleteAccount(account.id)} label="Delete account" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold">
              {formatCurrency(account.current_value, account.currency)}
            </p>
            {history.length > 1 ? (
              <p className={`text-xs ${change >= 0 ? "text-success" : "text-destructive"}`}>
                {change >= 0 ? "+" : ""}
                {formatCurrency(change, account.currency)} ({changePct.toFixed(1)}%) since first logged
              </p>
            ) : null}
          </div>
          {chartData.length > 1 ? (
            <div className="h-12 w-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <defs>
                    <linearGradient id={`spark-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-chart-1)"
                    fill={`url(#spark-${account.id})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>

        {contributions.length > 0 ? (
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-2.5 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Paid in</p>
              <p className="font-medium">{formatCurrency(netContributed, account.currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Gain / loss</p>
              <p className={`font-medium ${gain >= 0 ? "text-success" : "text-destructive"}`}>
                {gain >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(gain), account.currency)}
                {gainPct !== null ? ` (${gainPct >= 0 ? "+" : ""}${gainPct.toFixed(1)}%)` : ""}
              </p>
            </div>
          </div>
        ) : null}

        {holdings.length > 0 ? (
          <div className="flex items-center gap-3">
            <HoldingsPie holdings={holdings} />
            <CollapsibleGroup
              label="Holdings"
              count={holdings.length}
              totalLabel={formatCurrency(holdingsTotal, account.currency)}
              className="flex-1"
            >
              {holdings.map((holding) => (
                <HoldingRow key={holding.id} accountId={account.id} holding={holding} />
              ))}
            </CollapsibleGroup>
          </div>
        ) : null}

        {contributions.length > 0 ? (
          <CollapsibleGroup label="Contributions" count={contributions.length}>
            {contributions.map((contribution) => (
              <ContributionRow key={contribution.id} accountId={account.id} contribution={contribution} />
            ))}
          </CollapsibleGroup>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <LogValueDialog accountId={account.id} />
        <ContributionDialog accountId={account.id} />
        <HoldingDialog accountId={account.id} />
      </CardFooter>
    </Card>
  );
}
