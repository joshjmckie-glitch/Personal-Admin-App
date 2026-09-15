import { Card, CardContent } from "@/components/ui/card";
import { AllocationBar } from "@/components/modules/investments/allocation-bar";
import { NetWorthTrendChart } from "@/components/modules/investments/net-worth-trend-chart";
import { formatCurrency } from "@/lib/utils";

export function SummaryCard({
  total,
  accountCount,
  allocation,
  netWorthSeries,
}: {
  total: number;
  accountCount: number;
  allocation: { label: string; value: number }[];
  netWorthSeries: { date: string; total: number }[];
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-3xl font-semibold">{formatCurrency(total)}</p>
          <p className="text-xs text-muted-foreground">
            Across {accountCount} active account{accountCount === 1 ? "" : "s"}
          </p>
        </div>

        <NetWorthTrendChart series={netWorthSeries} />

        <AllocationBar breakdown={allocation} />
      </CardContent>
    </Card>
  );
}
