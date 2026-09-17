import { Badge } from "@/components/ui/badge";

/** Countdown badge for a monthly recurring charge — shorter thresholds than the annual-cadence Car one. */
export function DueBadge({ days }: { days: number }) {
  if (days === 0) return <Badge variant="destructive">Due today</Badge>;
  if (days <= 7) return <Badge variant="destructive">Due in {days}d</Badge>;
  if (days <= 14) return <Badge className="border-transparent bg-primary/20 text-primary">Due in {days}d</Badge>;
  return <Badge variant="success">Due in {days}d</Badge>;
}
