"use client";

import { useRouter } from "next/navigation";

import { DeleteButton } from "@/components/modules/delete-button";
import { NewTripDialog } from "@/components/modules/travel/new-trip-dialog";
import { deleteTrip } from "@/lib/actions/travel";
import { formatDate } from "@/lib/utils";
import type { TravelTripRow } from "@/lib/types/database";

export function TripHeader({ trip }: { trip: TravelTripRow }) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <h2 className="text-lg font-semibold">{trip.name}</h2>
        <p className="text-sm text-muted-foreground">
          {trip.destination ?? "No destination set"}
          {trip.start_date ? ` · ${formatDate(trip.start_date)}` : ""}
          {trip.end_date ? ` – ${formatDate(trip.end_date)}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <NewTripDialog trip={trip} />
        <DeleteButton
          onDelete={async () => {
            await deleteTrip(trip.id);
            router.push("/travel");
          }}
          label="Delete trip"
        />
      </div>
    </div>
  );
}
