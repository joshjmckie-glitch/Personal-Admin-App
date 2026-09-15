"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPerson, updatePerson } from "@/lib/actions/gifts";
import type { GiftPersonRow } from "@/lib/types/database";

export function NewPersonDialog({ person }: { person?: GiftPersonRow }) {
  const isEdit = Boolean(person);

  return (
    <FormDialog
      title={isEdit ? "Edit person" : "Add person"}
      submitLabel={isEdit ? "Save changes" : "Add person"}
      triggerLabel={isEdit ? undefined : "Add person"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Edit person">
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) => (isEdit ? updatePerson(person!.id, formData) : createPerson(formData))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Mum" defaultValue={person?.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Sizes, interests, etc."
          defaultValue={person?.notes ?? undefined}
        />
      </div>
    </FormDialog>
  );
}
