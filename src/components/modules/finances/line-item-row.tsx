"use client";

import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { deleteLineItem } from "@/lib/actions/finances";
import { formatCurrency } from "@/lib/utils";
import type { FinanceLineItemRow } from "@/lib/types/database";

const CATEGORY_LABEL: Record<string, string> = {
  subscription: "Subscription",
  savings: "Savings",
  rent: "Rent",
  bills: "Bills",
  other: "Other",
};

export function LineItemRow({ item }: { item: FinanceLineItemRow }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2">
        <Badge variant="outline">{CATEGORY_LABEL[item.category]}</Badge>
        <span className="truncate text-sm">{item.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
        <DeleteButton onDelete={() => deleteLineItem(item.id)} label="Delete item" />
      </div>
    </div>
  );
}
