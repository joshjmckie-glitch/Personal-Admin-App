"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { SERIES_COLOR_VARS } from "@/lib/modules/chart-series-colors";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentHoldingRow } from "@/lib/types/database";

export function HoldingsPie({ holdings }: { holdings: InvestmentHoldingRow[] }) {
  const total = holdings.reduce((sum, h) => sum + h.value, 0);
  if (total <= 0) return null;

  // Cap direct slices at 5 — fold anything past that into "Other" so the
  // fixed categorical colors never get reused for two different holdings.
  const sorted = [...holdings].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, 5);
  const overflow = sorted.slice(5);
  const overflowTotal = overflow.reduce((sum, h) => sum + h.value, 0);
  const data =
    overflowTotal > 0
      ? [...top.map((h) => ({ name: h.name, value: h.value })), { name: "Other", value: overflowTotal }]
      : top.map((h) => ({ name: h.name, value: h.value }));

  return (
    <div className="size-14 shrink-0" aria-label="Holdings split by value">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius="95%"
            stroke="var(--color-card)"
            strokeWidth={1.5}
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={SERIES_COLOR_VARS[i % SERIES_COLOR_VARS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatCurrency(Number(value)), name]}
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
            }}
            itemStyle={{ color: "var(--color-popover-foreground)" }}
            labelStyle={{ color: "var(--color-popover-foreground)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
