import { createClient } from "@/lib/supabase/server";
import { WidgetEmpty } from "@/components/dashboard/widget-card";
import { CountdownBadge } from "@/components/modules/car/countdown-badge";

export async function CarWidget() {
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("car_vehicles")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!vehicle) {
    return <WidgetEmpty text="No vehicle added yet" />;
  }

  const [{ data: mot }, { data: insurance }, { data: roadTax }] = await Promise.all([
    supabase
      .from("car_mot")
      .select("due_date")
      .eq("vehicle_id", vehicle.id)
      .order("due_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("car_insurance")
      .select("renewal_date")
      .eq("vehicle_id", vehicle.id)
      .order("renewal_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("car_road_tax")
      .select("due_date")
      .eq("vehicle_id", vehicle.id)
      .order("due_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">MOT</span>
        <CountdownBadge date={mot?.due_date ?? null} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Insurance</span>
        <CountdownBadge date={insurance?.renewal_date ?? null} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Road tax</span>
        <CountdownBadge date={roadTax?.due_date ?? null} />
      </div>
    </div>
  );
}
