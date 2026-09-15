"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createItineraryItem, updateItineraryItem } from "@/lib/actions/travel";
import type { TravelItineraryItemRow } from "@/lib/types/database";

export function ItineraryItemDialog({
  tripId,
  item,
}: {
  tripId: string;
  item?: TravelItineraryItemRow;
}) {
  const isEdit = Boolean(item);

  return (
    <FormDialog
      title={isEdit ? "Edit itinerary item" : "Add itinerary item"}
      submitLabel={isEdit ? "Save changes" : "Add"}
      triggerLabel={isEdit ? undefined : "Add item"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit item">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) =>
        isEdit ? updateItineraryItem(item!.id, tripId, formData) : createItineraryItem(tripId, formData)
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item_date">Date</Label>
          <Input id="item_date" name="item_date" type="date" required defaultValue={item?.item_date} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item_time">Time (optional)</Label>
          <Input
            id="item_time"
            name="item_time"
            type="time"
            defaultValue={item?.item_time ?? undefined}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Flight to Lisbon" defaultValue={item?.title} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          name="location"
          placeholder="Gatwick Airport"
          defaultValue={item?.location ?? undefined}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Notes (optional)</Label>
        <Textarea id="description" name="description" defaultValue={item?.description ?? undefined} />
      </div>
    </FormDialog>
  );
}
