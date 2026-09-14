"use client";

import Image from "next/image";
import { ChefHat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/modules/delete-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteRecipe } from "@/lib/actions/recipes";
import type { RecipeRow } from "@/lib/types/database";

export function RecipeCard({ recipe }: { recipe: RecipeRow }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="block w-full text-left">
            <div className="relative aspect-[4/3] w-full bg-secondary">
              {recipe.photo_url ? (
                <Image
                  src={recipe.photo_url}
                  alt={recipe.title}
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
              <p className="truncate text-sm font-medium">{recipe.title}</p>
              {recipe.tags.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {recipe.tags.slice(0, 3).map((tag) => (
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
            <DialogTitle>{recipe.title}</DialogTitle>
          </DialogHeader>
          {recipe.photo_url ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary">
              <Image src={recipe.photo_url} alt={recipe.title} fill className="object-cover" />
            </div>
          ) : null}
          {recipe.ingredients ? (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Ingredients</p>
              <p className="whitespace-pre-line text-sm">{recipe.ingredients}</p>
            </div>
          ) : null}
          {recipe.method ? (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Method</p>
              <p className="whitespace-pre-line text-sm">{recipe.method}</p>
            </div>
          ) : null}
          <div className="flex justify-end">
            <DeleteButton onDelete={() => deleteRecipe(recipe.id)} label="Delete recipe" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
