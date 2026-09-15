import { DeleteButton } from "@/components/modules/delete-button";
import { HoldingDialog } from "@/components/modules/investments/holding-dialog";
import { deleteHolding } from "@/lib/actions/investments";
import { formatCurrency } from "@/lib/utils";
import type { InvestmentHoldingRow } from "@/lib/types/database";

export function HoldingRow({
  accountId,
  holding,
}: {
  accountId: string;
  holding: InvestmentHoldingRow;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm">{holding.name}</p>
        {holding.quantity != null || holding.notes ? (
          <p className="truncate text-xs text-muted-foreground">
            {holding.quantity != null ? holding.quantity : ""}
            {holding.quantity != null && holding.notes ? " · " : ""}
            {holding.notes ?? ""}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{formatCurrency(holding.value)}</span>
        <HoldingDialog accountId={accountId} holding={holding} />
        <DeleteButton onDelete={() => deleteHolding(holding.id)} label="Delete holding" />
      </div>
    </div>
  );
}
