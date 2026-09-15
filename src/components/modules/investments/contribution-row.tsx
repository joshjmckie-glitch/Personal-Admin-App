import { DeleteButton } from "@/components/modules/delete-button";
import { ContributionDialog } from "@/components/modules/investments/contribution-dialog";
import { deleteContribution } from "@/lib/actions/investments";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvestmentContributionRow } from "@/lib/types/database";

export function ContributionRow({
  accountId,
  contribution,
}: {
  accountId: string;
  contribution: InvestmentContributionRow;
}) {
  const isWithdrawal = contribution.amount < 0;

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/50 py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm">
          {formatDate(contribution.contributed_on)}
          {contribution.notes ? ` · ${contribution.notes}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-medium ${isWithdrawal ? "text-destructive" : "text-success"}`}>
          {isWithdrawal ? "-" : "+"}
          {formatCurrency(Math.abs(contribution.amount))}
        </span>
        <ContributionDialog accountId={accountId} contribution={contribution} />
        <DeleteButton onDelete={() => deleteContribution(contribution.id)} label="Delete contribution" />
      </div>
    </div>
  );
}
