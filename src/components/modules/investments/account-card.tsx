"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { LogValueDialog } from "@/components/modules/investments/log-value-dialog";
import { NewAccountDialog } from "@/components/modules/investments/new-account-dialog";
import { deleteAccount } from "@/lib/actions/investments";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentAccountRow, InvestmentValueHistoryRow } from "@/lib/types/database";

const PROVIDER_LABEL: Record<string, string> = {
  chase: "Chase",
  moneybox: "Moneybox",
  trading212: "Trading 212",
  coinbase: "Coinbase",
  other: "Other",
};

const TYPE_LABEL: Record<string, string> = {
  cash_savings: "Cash savings",
  isa: "ISA",
  brokerage: "Brokerage",
  crypto: "Crypto",
  pension: "Pension",
  other: "Other",
};

export function AccountCard({
  account,
  history,
}: {
  account: InvestmentAccountRow;
  history: InvestmentValueHistoryRow[];
}) {
  const chartData = history.map((h) => ({ value: h.value }));
  const first = history[0]?.value ?? account.current_value;
  const change = account.current_value - first;
  const changePct = first !== 0 ? (change / first) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-foreground">{account.name}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge variant="outline">{PROVIDER_LABEL[account.provider]}</Badge>
            <Badge variant="outline">{TYPE_LABEL[account.account_type]}</Badge>
            {account.sync_mode !== "manual" ? (
              <Badge variant="success">Live sync</Badge>
            ) : (
              <Badge variant="secondary">Manual</Badge>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <NewAccountDialog account={account} />
          <DeleteButton onDelete={() => deleteAccount(account.id)} label="Delete account" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold">
              {formatCurrency(account.current_value, account.currency)}
            </p>
            {history.length > 1 ? (
              <p className={`text-xs ${change >= 0 ? "text-success" : "text-destructive"}`}>
                {change >= 0 ? "+" : ""}
                {formatCurrency(change, account.currency)} ({changePct.toFixed(1)}%)
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
      </CardContent>
      <CardFooter>
        <LogValueDialog accountId={account.id} />
      </CardFooter>
    </Card>
  );
}
