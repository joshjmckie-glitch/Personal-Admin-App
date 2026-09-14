import { format } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";

export async function RecipesWidget() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const [{ count: recipeCount }, { data: todayMeals }] = await Promise.all([
    supabase.from("recipes").select("*", { count: "exact", head: true }),
    supabase.from("meal_plan_entries").select("meal_slot, title_override, recipe_id").eq("planned_date", today),
  ]);

  if (!recipeCount && (!todayMeals || todayMeals.length === 0)) {
    return <WidgetEmpty text="No recipes yet" />;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xl font-semibold">{recipeCount ?? 0} recipes</p>
      <p className="text-xs text-muted-foreground">
        {todayMeals && todayMeals.length > 0
          ? `${todayMeals.length} meal(s) planned today`
          : "Nothing planned today"}
      </p>
    </div>
  );
}
