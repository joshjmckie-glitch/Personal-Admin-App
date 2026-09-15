"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DeleteButton } from "@/components/modules/delete-button";
import { ItineraryItemDialog } from "@/components/modules/travel/itinerary-item-dialog";
import { deleteItineraryItem } from "@/lib/actions/travel";
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
        <ItineraryItemDialog tripId={tripId} />
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
                <div className="flex items-center gap-1">
                  <ItineraryItemDialog tripId={tripId} item={item} />
                  <DeleteButton onDelete={() => deleteItineraryItem(item.id, tripId)} label="Delete item" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
