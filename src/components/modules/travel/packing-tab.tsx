"use client";

import { useTransition } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteButton } from "@/components/modules/delete-button";
import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPackingItem,
  deletePackingItem,
  togglePackingItem,
} from "@/lib/actions/travel";
import { cn } from "@/lib/utils";
import type { TravelPackingItemRow } from "@/lib/types/database";

export function PackingTab({ tripId, items }: { tripId: string; items: TravelPackingItemRow[] }) {
  const packedCount = items.filter((i) => i.packed).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {packedCount}/{items.length} packed
        </p>
        <FormDialog
          title="Add packing item"
          submitLabel="Add"
          triggerLabel="Add item"
          onSubmit={(formData) => createPackingItem(tripId, formData)}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item">Item</Label>
            <Input id="item" name="item" required placeholder="Passport" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category (optional)</Label>
            <Input id="category" name="category" placeholder="Documents" />
          </div>
        </FormDialog>
      </div>

      <Card>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No items yet.</p>
          ) : (
            items.map((item) => <PackingRow key={item.id} item={item} tripId={tripId} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PackingRow({ item, tripId }: { item: TravelPackingItemRow; tripId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 border-b border-border/50 py-2.5 last:border-b-0">
      <Checkbox
        checked={item.packed}
        disabled={pending}
        onCheckedChange={(checked) =>
          startTransition(() => togglePackingItem(item.id, tripId, checked === true))
        }
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", item.packed && "text-muted-foreground line-through")}>
          {item.item}
        </p>
        {item.category ? <p className="text-xs text-muted-foreground">{item.category}</p> : null}
      </div>
      <DeleteButton onDelete={() => deletePackingItem(item.id, tripId)} label="Remove item" />
    </div>
  );
}
