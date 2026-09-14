import Link from "next/link";
import { MapPin } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TravelTripRow } from "@/lib/types/database";

export function TripCard({ trip, total }: { trip: TravelTripRow; total: number }) {
  return (
    <Link href={`/travel/${trip.id}`}>
      <Card className="transition-colors hover:border-primary/40">
        <CardHeader>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">{trip.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              {trip.destination ? (
                <>
                  <MapPin className="size-3" /> {trip.destination}
                </>
              ) : null}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {trip.start_date ? formatDate(trip.start_date) : "No dates set"}
            {trip.end_date ? ` – ${formatDate(trip.end_date)}` : ""}
          </p>
          {total > 0 ? <p className="text-sm font-medium">{formatCurrency(total)}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
