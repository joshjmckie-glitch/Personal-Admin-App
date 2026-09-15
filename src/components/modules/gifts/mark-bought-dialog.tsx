"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TickButton } from "@/components/modules/gifts/tick-button";
import { markGiftPurchased } from "@/lib/actions/gifts";
import type { GiftIdeaRow } from "@/lib/types/database";

export function MarkBoughtDialog({ idea }: { idea: GiftIdeaRow }) {
  return (
    <FormDialog
      title="Mark as bought"
      submitLabel="Save"
      trigger={<TickButton checked={false} aria-label="Mark as bought" />}
      onSubmit={(formData) => markGiftPurchased(idea.id, formData)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="actual_price">Actual price paid</Label>
        <Input
          id="actual_price"
          name="actual_price"
          type="number"
          step="0.01"
          required
          placeholder="60"
          defaultValue={idea.expected_price ?? undefined}
        />
      </div>
    </FormDialog>
  );
}
