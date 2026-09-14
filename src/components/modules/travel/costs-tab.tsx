"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCost, deleteCost } from "@/lib/actions/travel";
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
        <FormDialog
          title="Add cost"
          submitLabel="Add"
          triggerLabel="Add cost"
          onSubmit={(formData) => createCost(tripId, formData)}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="flights">
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Return flights" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue="GBP" maxLength={3} />
            </div>
          </div>
        </FormDialog>
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
