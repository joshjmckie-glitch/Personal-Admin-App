import { createClient } from "@/lib/supabase/server";
import { NewTripDialog } from "@/components/modules/travel/new-trip-dialog";
import { TripCard } from "@/components/modules/travel/trip-card";

export default async function TravelPage() {
  const supabase = await createClient();

  const { data: trips } = await supabase
    .from("travel_trips")
    .select("*")
    .order("start_date", { ascending: true, nullsFirst: false });

  const tripIds = (trips ?? []).map((t) => t.id);
  const totalsByTrip = new Map<string, number>();

  if (tripIds.length > 0) {
    const { data: costs } = await supabase
      .from("travel_costs")
      .select("trip_id, amount")
      .in("trip_id", tripIds);

    for (const cost of costs ?? []) {
      totalsByTrip.set(cost.trip_id, (totalsByTrip.get(cost.trip_id) ?? 0) + cost.amount);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Travel</h2>
          <p className="text-sm text-muted-foreground">Trips, packing & itineraries</p>
        </div>
        <NewTripDialog />
      </div>

      {!trips || trips.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No trips yet. Add one to start planning.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} total={totalsByTrip.get(trip.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
