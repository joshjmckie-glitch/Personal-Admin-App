"use client";

import { Plus } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGiftIdea } from "@/lib/actions/gifts";

export function NewIdeaDialog({ personId }: { personId: string }) {
  return (
    <FormDialog
      title="Add gift idea"
      submitLabel="Add idea"
      trigger={
        <Button type="button" variant="ghost" size="sm">
          <Plus />
          Add idea
        </Button>
      }
      onSubmit={(formData) => createGiftIdea(personId, formData)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="idea">Idea</Label>
        <Input id="idea" name="idea" required placeholder="Wireless headphones" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expected_price">Expected price (optional)</Label>
        <Input id="expected_price" name="expected_price" type="number" step="0.01" placeholder="60" />
      </div>
    </FormDialog>
  );
}
