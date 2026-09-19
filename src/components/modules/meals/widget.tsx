import { format } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";

export async function MealsWidget() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [{ count: mealCount }, { data: todayPlan }] = await Promise.all([
    supabase.from("recipes").select("*", { count: "exact", head: true }),
    supabase.from("meal_plan_entries").select("meal_slot, title_override, meal_id").eq("planned_date", today),
  ]);

  if (!mealCount && (!todayPlan || todayPlan.length === 0)) {
    return <WidgetEmpty text="No meals yet" />;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xl font-semibold">{mealCount ?? 0} meals</p>
      <p className="text-xs text-muted-foreground">
        {todayPlan && todayPlan.length > 0
          ? `${todayPlan.length} planned today`
          : "Nothing planned today"}
      </p>
    </div>
  );
}
