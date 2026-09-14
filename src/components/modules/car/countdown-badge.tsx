import { Badge } from "@/components/ui/badge";
import { daysUntil } from "@/lib/utils";

export function CountdownBadge({ date }: { date: string | null }) {
  if (!date) return <Badge variant="secondary">Not set</Badge>;

  const days = daysUntil(date);

  if (days < 0) return <Badge variant="destructive">Overdue by {Math.abs(days)}d</Badge>;
  if (days === 0) return <Badge variant="destructive">Due today</Badge>;
  if (days <= 30) return <Badge variant="destructive">Due in {days}d</Badge>;
  if (days <= 90) return <Badge className="border-transparent bg-primary/20 text-primary">Due in {days}d</Badge>;
  return <Badge variant="success">Due in {days}d</Badge>;
}
