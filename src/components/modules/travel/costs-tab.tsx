"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { CostDialog } from "@/components/modules/travel/cost-dialog";
import { deleteCost } from "@/lib/actions/travel";
import { formatCurrency } from "@/lib/utils";
import type { TravelCostRow } from "@/lib/types/database";

const CATEGORY_LABEL: Record<string, string> = {
  flights: "Flights",
  hotel: "Hotel",
  food: "Food",
  transport: "Transport",
  activities: "Activities",
  other: "Other",
};

export function CostsTab({ tripId, costs }: { tripId: string; costs: TravelCostRow[] }) {
  const total = costs.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Total: {formatCurrency(total)}</p>
        <CostDialog tripId={tripId} />
      </div>

      <Card>
        <CardContent>
          {costs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No costs logged yet.</p>
          ) : (
            costs.map((cost) => (
              <div
                key={cost.id}
                className="flex items-center justify-between gap-2 border-b border-border/50 py-2.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Badge variant="outline">{CATEGORY_LABEL[cost.category]}</Badge>
                  <span className="truncate text-sm">{cost.description || "—"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {formatCurrency(cost.amount, cost.currency)}
                  </span>
                  <CostDialog tripId={tripId} cost={cost} />
                  <DeleteButton onDelete={() => deleteCost(cost.id, tripId)} label="Delete cost" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
