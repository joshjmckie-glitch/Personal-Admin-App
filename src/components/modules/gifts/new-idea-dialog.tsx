"use client";

import { Plus, Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGiftIdea, updateGiftIdea } from "@/lib/actions/gifts";
import type { GiftIdeaRow } from "@/lib/types/database";

export function NewIdeaDialog({ personId, idea }: { personId: string; idea?: GiftIdeaRow }) {
  const isEdit = Boolean(idea);

  return (
    <FormDialog
      title={isEdit ? "Edit gift idea" : "Add gift idea"}
      submitLabel={isEdit ? "Save changes" : "Add idea"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit idea">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm">
            <Plus />
            Add idea
          </Button>
        )
      }
      onSubmit={(formData) =>
        isEdit ? updateGiftIdea(idea!.id, formData) : createGiftIdea(personId, formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="idea">Idea</Label>
        <Input id="idea" name="idea" required placeholder="Wireless headphones" defaultValue={idea?.idea} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expected_price">Expected price (optional)</Label>
        <Input
          id="expected_price"
          name="expected_price"
          type="number"
          step="0.01"
          placeholder="60"
          defaultValue={idea?.expected_price ?? undefined}
        />
      </div>
    </FormDialog>
  );
}
