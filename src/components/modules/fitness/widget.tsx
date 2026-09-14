import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";
import { ACTIVITY_LABEL } from "@/components/modules/fitness/activity-select";

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = (day + 6) % 7; // Monday as start of week
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
  return monday.toISOString().slice(0, 10);
}

export async function FitnessWidget() {
  const supabase = await createClient();

  const [{ count: weekCount }, { data: pb }] = await Promise.all([
    supabase
      .from("fitness_sessions")
      .select("*", { count: "exact", head: true })
      .gte("scheduled_date", startOfWeek()),
    supabase
      .from("fitness_personal_bests")
      .select("*")
      .order("achieved_on", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!weekCount && !pb) {
    return <WidgetEmpty text="No sessions or PBs yet" />;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xl font-semibold">{weekCount ?? 0} sessions this week</p>
      {pb ? (
        <p className="text-xs text-muted-foreground">
          PB: {ACTIVITY_LABEL[pb.activity_type]} {pb.metric} — {pb.value}
        </p>
      ) : null}
    </div>
  );
}
