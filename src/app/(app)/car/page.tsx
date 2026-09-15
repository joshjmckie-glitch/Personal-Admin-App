import { createClient } from "@/lib/supabase/server";
import { NewVehicleDialog } from "@/components/modules/car/new-vehicle-dialog";
import { VehicleCard } from "@/components/modules/car/vehicle-card";
import type { CarInsuranceRow, CarMaintenanceLogRow, CarMotRow, CarRoadTaxRow } from "@/lib/types/database";

export default async function CarPage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from("car_vehicles")
    .select("*")
    .order("created_at", { ascending: true });

  const vehicleIds = (vehicles ?? []).map((v) => v.id);

  const latestInsurance = new Map<string, CarInsuranceRow>();
  const latestMot = new Map<string, CarMotRow>();
  const latestRoadTax = new Map<string, CarRoadTaxRow>();
  let maintenanceByVehicle = new Map<string, CarMaintenanceLogRow[]>();

  if (vehicleIds.length > 0) {
    const [{ data: insurance }, { data: mot }, { data: roadTax }, { data: maintenance }] = await Promise.all([
      supabase
        .from("car_insurance")
        .select("*")
        .in("vehicle_id", vehicleIds)
        .order("renewal_date", { ascending: false }),
      supabase
        .from("car_mot")
        .select("*")
        .in("vehicle_id", vehicleIds)
        .order("due_date", { ascending: false }),
      supabase
        .from("car_road_tax")
        .select("*")
        .in("vehicle_id", vehicleIds)
        .order("due_date", { ascending: false }),
      supabase
        .from("car_maintenance_log")
        .select("*")
        .in("vehicle_id", vehicleIds)
        .order("performed_on", { ascending: false }),
    ]);

    for (const row of insurance ?? []) {
      if (!latestInsurance.has(row.vehicle_id)) latestInsurance.set(row.vehicle_id, row);
    }
    for (const row of mot ?? []) {
      if (!latestMot.has(row.vehicle_id)) latestMot.set(row.vehicle_id, row);
    }
    for (const row of roadTax ?? []) {
      if (!latestRoadTax.has(row.vehicle_id)) latestRoadTax.set(row.vehicle_id, row);
    }
    maintenanceByVehicle = (maintenance ?? []).reduce((map, row) => {
      const list = map.get(row.vehicle_id) ?? [];
      list.push(row);
      map.set(row.vehicle_id, list);
      return map;
    }, new Map<string, CarMaintenanceLogRow[]>());
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Car</h2>
          <p className="text-sm text-muted-foreground">Insurance, MOT & maintenance</p>
        </div>
        <NewVehicleDialog />
      </div>

      {!vehicles || vehicles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No vehicle yet. Add one to start tracking insurance, MOT and servicing.
        </p>
      ) : (
        vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            insurance={latestInsurance.get(vehicle.id) ?? null}
            mot={latestMot.get(vehicle.id) ?? null}
            roadTax={latestRoadTax.get(vehicle.id) ?? null}
            maintenance={maintenanceByVehicle.get(vehicle.id) ?? []}
          />
        ))
      )}
    </div>
  );
}
