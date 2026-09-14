import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";

export async function GiftsWidget() {
  const supabase = await createClient();

  const [{ count: peopleCount }, { count: ideaCount }] = await Promise.all([
    supabase.from("gift_people").select("*", { count: "exact", head: true }),
    supabase.from("gift_ideas").select("*", { count: "exact", head: true }).eq("status", "idea"),
  ]);

  if (!peopleCount) {
    return <WidgetEmpty text="No one added yet" />;
  }

  return (
    <div>
      <p className="text-xl font-semibold">{ideaCount ?? 0} open ideas</p>
      <p className="text-xs text-muted-foreground">
        Across {peopleCount} {peopleCount === 1 ? "person" : "people"}
      </p>
    </div>
  );
}
