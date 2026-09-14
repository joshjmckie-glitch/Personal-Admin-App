"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DeleteButton } from "@/components/modules/delete-button";
import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createItineraryItem, deleteItineraryItem } from "@/lib/actions/travel";
import { formatDate } from "@/lib/utils";
import type { TravelItineraryItemRow } from "@/lib/types/database";

export function ItineraryTab({
  tripId,
  items,
}: {
  tripId: string;
  items: TravelItineraryItemRow[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <FormDialog
          title="Add itinerary item"
          submitLabel="Add"
          triggerLabel="Add item"
          onSubmit={(formData) => createItineraryItem(tripId, formData)}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item_date">Date</Label>
              <Input id="item_date" name="item_date" type="date" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item_time">Time (optional)</Label>
              <Input id="item_time" name="item_time" type="time" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Flight to Lisbon" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location (optional)</Label>
            <Input id="location" name="location" placeholder="Gatwick Airport" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea id="description" name="description" />
          </div>
        </FormDialog>
      </div>

      <Card>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No itinerary yet.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2 border-b border-border/50 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.item_date)}
                    {item.item_time ? ` · ${item.item_time}` : ""}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                  {item.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
                <DeleteButton onDelete={() => deleteItineraryItem(item.id, tripId)} label="Delete item" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
