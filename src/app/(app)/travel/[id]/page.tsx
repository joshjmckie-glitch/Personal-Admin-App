import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripHeader } from "@/components/modules/travel/trip-header";
import { PackingTab } from "@/components/modules/travel/packing-tab";
import { ItineraryTab } from "@/components/modules/travel/itinerary-tab";
import { CostsTab } from "@/components/modules/travel/costs-tab";

export default async function TripPage(props: PageProps<"/travel/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: trip } = await supabase.from("travel_trips").select("*").eq("id", id).maybeSingle();
  if (!trip) notFound();

  const [{ data: packing }, { data: itinerary }, { data: costs }] = await Promise.all([
    supabase
      .from("travel_packing_items")
      .select("*")
      .eq("trip_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("travel_itinerary_items")
      .select("*")
      .eq("trip_id", id)
      .order("item_date", { ascending: true }),
    supabase.from("travel_costs").select("*").eq("trip_id", id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <TripHeader trip={trip} />

      <Tabs defaultValue="packing">
        <TabsList>
          <TabsTrigger value="packing">Packing</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="packing">
          <PackingTab tripId={id} items={packing ?? []} />
        </TabsContent>
        <TabsContent value="itinerary">
          <ItineraryTab tripId={id} items={itinerary ?? []} />
        </TabsContent>
        <TabsContent value="costs">
          <CostsTab tripId={id} costs={costs ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
