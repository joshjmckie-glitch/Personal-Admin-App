import { Progress } from "@/components/ui/progress";
import type { FitnessSessionRow } from "@/lib/types/database";

export function WeeklyProgress({ sessionsThisWeek }: { sessionsThisWeek: FitnessSessionRow[] }) {
  if (sessionsThisWeek.length === 0) return null;

  const completed = sessionsThisWeek.filter((s) => s.completed).length;
  const total = sessionsThisWeek.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">This week</span>
        <span className="text-muted-foreground">
          {completed} of {total} done
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
