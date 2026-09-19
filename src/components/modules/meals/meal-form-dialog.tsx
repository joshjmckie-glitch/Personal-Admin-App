"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadRecipePhoto } from "@/lib/supabase/recipe-photos";
import { createRecipe, updateRecipe } from "@/lib/actions/meals";
import { MEAL_SLOT_ORDER, MEAL_SLOT_LABEL } from "@/lib/modules/meal-slots";
import type { MealSlot, RecipeRow } from "@/lib/types/database";

export function MealFormDialog({
  meal,
  trigger,
}: {
  meal?: RecipeRow;
  trigger?: React.ReactNode;
}) {
  const isEdit = Boolean(meal);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const title = String(formData.get("title"));
        const ingredients = String(formData.get("ingredients") ?? "");
        const method = String(formData.get("method") ?? "");
        const tagsRaw = String(formData.get("tags") ?? "");
        const tags = tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        const meal_type = formData.getAll("meal_type") as MealSlot[];
        const file = formData.get("photo") as File | null;

        let photo_url: string | null = meal?.photo_url ?? null;
        if (file && file.size > 0) {
          photo_url = await uploadRecipePhoto(file);
        }

        if (isEdit) {
          await updateRecipe(meal!.id, { title, ingredients, method, tags, meal_type, photo_url });
        } else {
          await createRecipe({ title, ingredients, method, tags, meal_type, photo_url });
        }
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="secondary">
            {isEdit ? <Pencil /> : <Plus />}
            {isEdit ? "Edit" : "Add meal"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit meal" : "Add meal"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Chicken traybake" defaultValue={meal?.title} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Meal type</Label>
            <div className="flex flex-wrap gap-4">
              {MEAL_SLOT_ORDER.map((slot) => (
                <label key={slot} className="flex items-center gap-2 text-sm">
                  <Checkbox name="meal_type" value={slot} defaultChecked={meal?.meal_type.includes(slot)} />
                  {MEAL_SLOT_LABEL[slot]}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="quick, high-protein, meal-prep"
              defaultValue={meal?.tags.join(", ")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              placeholder="One per line"
              className="min-h-24"
              defaultValue={meal?.ingredients}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method">Method</Label>
            <Textarea
              id="method"
              name="method"
              placeholder="Step by step"
              className="min-h-24"
              defaultValue={meal?.method}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo">Photo{isEdit ? " (optional — replaces current)" : " (optional)"}</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add meal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
