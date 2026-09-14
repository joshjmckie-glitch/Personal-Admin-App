"use client";

import { Plus } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMealPlanEntry } from "@/lib/actions/recipes";
import type { RecipeRow } from "@/lib/types/database";

export function NewMealDialog({
  date,
  recipes,
  trigger,
}: {
  date: string;
  recipes: Pick<RecipeRow, "id" | "title">[];
  trigger?: React.ReactNode;
}) {
  return (
    <FormDialog
      title="Add to meal plan"
      submitLabel="Add"
      trigger={
        trigger ?? (
          <Button type="button" variant="ghost" size="icon" className="size-6">
            <Plus className="size-3.5" />
          </Button>
        )
      }
      onSubmit={createMealPlanEntry}
    >
      <input type="hidden" name="planned_date" value={date} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="meal_slot">Meal</Label>
        <Select name="meal_slot" defaultValue="dinner">
          <SelectTrigger id="meal_slot">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {recipes.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recipe_id">From recipe library (optional)</Label>
          <Select name="recipe_id">
            <SelectTrigger id="recipe_id">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {recipes.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title_override">Or custom meal name</Label>
        <Input id="title_override" name="title_override" placeholder="Leftovers" />
      </div>
    </FormDialog>
  );
}
