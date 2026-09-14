import { format } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";
import { formatDate } from "@/lib/utils";

export async function TravelWidget() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: trip } = await supabase
    .from("travel_trips")
    .select("*")
    .gte("end_date", today)
    .order("start_date", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (!trip) {
    return <WidgetEmpty text="No upcoming trips" />;
  }

  return (
    <div>
      <p className="text-sm font-semibold">{trip.name}</p>
      <p className="text-xs text-muted-foreground">
        {trip.start_date ? formatDate(trip.start_date) : "Dates TBC"}
        {trip.destination ? ` · ${trip.destination}` : ""}
      </p>
    </div>
  );
}
