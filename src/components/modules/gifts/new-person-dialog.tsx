"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPerson } from "@/lib/actions/gifts";

export function NewPersonDialog() {
  return (
    <FormDialog title="Add person" triggerLabel="Add person" submitLabel="Add person" onSubmit={createPerson}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Mum" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" name="notes" placeholder="Sizes, interests, etc." />
      </div>
    </FormDialog>
  );
}
