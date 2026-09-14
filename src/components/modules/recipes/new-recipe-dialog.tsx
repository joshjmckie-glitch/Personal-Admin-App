"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

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
import { createClient } from "@/lib/supabase/client";
import { createRecipe } from "@/lib/actions/recipes";

export function NewRecipeDialog() {
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

        let photo_url: string | null = null;
        if (file && file.size > 0) {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const ext = file.name.split(".").pop() || "jpg";
          const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("recipe-photos")
            .upload(path, file);
          if (uploadError) throw new Error(uploadError.message);

          const { data: publicUrl } = supabase.storage.from("recipe-photos").getPublicUrl(path);
          photo_url = publicUrl.publicUrl;
        }

        await createRecipe({ title, ingredients, method, tags, photo_url });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Plus />
          Add recipe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add recipe</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Chicken traybake" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" name="tags" placeholder="quick, high-protein, meal-prep" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea id="ingredients" name="ingredients" placeholder="One per line" className="min-h-24" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method">Method</Label>
            <Textarea id="method" name="method" placeholder="Step by step" className="min-h-24" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="photo">Photo (optional)</Label>
            <Input id="photo" name="photo" type="file" accept="image/*" />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add recipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
