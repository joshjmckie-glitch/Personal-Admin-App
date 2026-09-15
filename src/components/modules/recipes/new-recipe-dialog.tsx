"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadRecipePhoto } from "@/lib/supabase/recipe-photos";
import { createRecipe, updateRecipe } from "@/lib/actions/recipes";
import type { RecipeRow } from "@/lib/types/database";

export function NewRecipeDialog({
  recipe,
  trigger,
}: {
  recipe?: RecipeRow;
  trigger?: React.ReactNode;
}) {
  const isEdit = Boolean(recipe);
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
        const file = formData.get("photo") as File | null;

        let photo_url: string | null = recipe?.photo_url ?? null;
        if (file && file.size > 0) {
          photo_url = await uploadRecipePhoto(file);
        }

        if (isEdit) {
          await updateRecipe(recipe!.id, { title, ingredients, method, tags, photo_url });
        } else {
          await createRecipe({ title, ingredients, method, tags, photo_url });
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
            {isEdit ? "Edit" : "Add recipe"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit recipe" : "Add recipe"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Chicken traybake" defaultValue={recipe?.title} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="quick, high-protein, meal-prep"
              defaultValue={recipe?.tags.join(", ")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              placeholder="One per line"
              className="min-h-24"
              defaultValue={recipe?.ingredients}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method">Method</Label>
            <Textarea
              id="method"
              name="method"
              placeholder="Step by step"
              className="min-h-24"
              defaultValue={recipe?.method}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo">Photo{isEdit ? " (optional — replaces current)" : " (optional)"}</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add recipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
