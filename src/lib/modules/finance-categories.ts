import type { FinanceCategory } from "@/lib/types/database";

export const CATEGORY_LABEL: Record<FinanceCategory, string> = {
  subscription: "Subscriptions",
  savings: "Savings",
  rent: "Rent",
  bills: "Bills",
  other: "Other",
};

export const CATEGORY_ORDER: FinanceCategory[] = ["subscription", "savings", "rent", "bills", "other"];
