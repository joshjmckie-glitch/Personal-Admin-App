"use client";

import Image from "next/image";
import { ChefHat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import { MealFormDialog } from "@/components/modules/meals/meal-form-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteRecipe } from "@/lib/actions/meals";
import { MEAL_SLOT_LABEL } from "@/lib/modules/meal-slots";
import type { RecipeRow } from "@/lib/types/database";

export function MealCard({ meal }: { meal: RecipeRow }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="block w-full text-left">
            <div className="relative aspect-[4/3] w-full bg-secondary">
              {meal.photo_url ? (
                <Image
                  src={meal.photo_url}
                  alt={meal.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 240px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ChefHat className="size-8" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{meal.title}</p>
              {meal.meal_type.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {meal.meal_type.map((slot) => (
                    <Badge key={slot} className="text-[10px]">
                      {MEAL_SLOT_LABEL[slot]}
                    </Badge>
                  ))}
                </div>
              ) : null}
              {meal.tags.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {meal.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{meal.title}</DialogTitle>
          </DialogHeader>
          {meal.photo_url ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary">
              <Image src={meal.photo_url} alt={meal.title} fill className="object-cover" />
            </div>
          ) : null}
          {meal.ingredients ? (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Ingredients</p>
              <p className="whitespace-pre-line text-sm">{meal.ingredients}</p>
            </div>
          ) : null}
          {meal.method ? (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Method</p>
              <p className="whitespace-pre-line text-sm">{meal.method}</p>
            </div>
          ) : null}
          <div className="flex justify-end gap-1">
            <MealFormDialog meal={meal} />
            <DeleteButton onDelete={() => deleteRecipe(meal.id)} label="Delete meal" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
