import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewRecipeDialog } from "@/components/modules/recipes/new-recipe-dialog";
import { RecipeCard } from "@/components/modules/recipes/recipe-card";
import { MealPlanner } from "@/components/modules/recipes/meal-planner";
import { addDays, format, subDays } from "date-fns";

export default async function RecipesPage() {
  const supabase = await createClient();

  const rangeStart = format(subDays(new Date(), 45), "yyyy-MM-dd");
  const rangeEnd = format(addDays(new Date(), 60), "yyyy-MM-dd");

  const [{ data: recipes }, { data: mealEntries }] = await Promise.all([
    supabase.from("recipes").select("*").order("created_at", { ascending: false }),
    supabase
      .from("meal_plan_entries")
      .select("*")
      .gte("planned_date", rangeStart)
      .lte("planned_date", rangeEnd),
  ]);

  const recipeTitleById = new Map((recipes ?? []).map((r) => [r.id, r.title]));
  const enrichedEntries = (mealEntries ?? []).map((entry) => ({
    ...entry,
    recipe_title: entry.recipe_id ? recipeTitleById.get(entry.recipe_id) ?? null : null,
  }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Recipes & Meal Prep</h2>
        <p className="text-sm text-muted-foreground">Recipe library & meal planner</p>
      </div>

      <Tabs defaultValue="planner">
        <TabsList>
          <TabsTrigger value="planner">Meal plan</TabsTrigger>
          <TabsTrigger value="library">Recipes</TabsTrigger>
        </TabsList>

        <TabsContent value="planner">
          <MealPlanner entries={enrichedEntries} recipes={recipes ?? []} />
        </TabsContent>

        <TabsContent value="library" className="flex flex-col gap-3">
          <div className="flex justify-end">
            <NewRecipeDialog />
          </div>
          {!recipes || recipes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              No recipes yet. Add your first one.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
