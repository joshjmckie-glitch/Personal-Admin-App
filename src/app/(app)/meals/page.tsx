import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MealLibrary } from "@/components/modules/meals/meal-library";
import { MealPlanner } from "@/components/modules/meals/meal-planner";
import { addDays, format, subDays } from "date-fns";

export default async function MealsPage() {
  const supabase = await createClient();

  const rangeStart = format(subDays(new Date(), 45), "yyyy-MM-dd");
  const rangeEnd = format(addDays(new Date(), 60), "yyyy-MM-dd");

  const [{ data: meals }, { data: mealEntries }] = await Promise.all([
    supabase.from("recipes").select("*").order("created_at", { ascending: false }),
    supabase
      .from("meal_plan_entries")
      .select("*")
      .gte("planned_date", rangeStart)
      .lte("planned_date", rangeEnd),
  ]);

  const mealTitleById = new Map((meals ?? []).map((m) => [m.id, m.title]));
  const enrichedEntries = (mealEntries ?? []).map((entry) => ({
    ...entry,
    meal_title: entry.meal_id ? mealTitleById.get(entry.meal_id) ?? null : null,
  }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Meals</h2>
        <p className="text-sm text-muted-foreground">Meal library & meal plan</p>
      </div>

      <Tabs defaultValue="planner">
        <TabsList>
          <TabsTrigger value="planner">Meal plan</TabsTrigger>
          <TabsTrigger value="library">Meals</TabsTrigger>
        </TabsList>

        <TabsContent value="planner">
          <MealPlanner entries={enrichedEntries} meals={meals ?? []} />
        </TabsContent>

        <TabsContent value="library">
          <MealLibrary meals={meals ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
