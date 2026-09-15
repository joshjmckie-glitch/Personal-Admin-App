"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeleteButton } from "@/components/modules/delete-button";
import { CountdownBadge } from "@/components/modules/car/countdown-badge";
import { InsuranceDialog } from "@/components/modules/car/insurance-dialog";
import { MotDialog } from "@/components/modules/car/mot-dialog";
import { RoadTaxDialog } from "@/components/modules/car/road-tax-dialog";
import { MaintenanceDialog } from "@/components/modules/car/maintenance-dialog";
import { NewVehicleDialog } from "@/components/modules/car/new-vehicle-dialog";
import { deleteVehicle, deleteMaintenanceEntry } from "@/lib/actions/car";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  CarInsuranceRow,
  CarMaintenanceLogRow,
  CarMotRow,
  CarRoadTaxRow,
  CarVehicleRow,
} from "@/lib/types/database";

const TYPE_LABEL: Record<string, string> = {
  service: "Service",
  tyre_change: "Tyre change",
  repair: "Repair",
};

export function VehicleCard({
  vehicle,
  insurance,
  mot,
  roadTax,
  maintenance,
}: {
  vehicle: CarVehicleRow;
  insurance: CarInsuranceRow | null;
  mot: CarMotRow | null;
  roadTax: CarRoadTaxRow | null;
  maintenance: CarMaintenanceLogRow[];
}) {
  const title = [vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Vehicle";

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
          <CardDescription>
            {[vehicle.registration, vehicle.year].filter(Boolean).join(" · ") || "No details yet"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <NewVehicleDialog vehicle={vehicle} />
          <DeleteButton onDelete={() => deleteVehicle(vehicle.id)} label="Delete vehicle" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Insurance</p>
              {insurance ? <InsuranceDialog vehicleId={vehicle.id} record={insurance} /> : null}
            </div>
            <p className="text-sm font-medium">
              {insurance?.price ? formatCurrency(insurance.price) : "—"}
            </p>
            <div className="mt-1">
              <CountdownBadge date={insurance?.renewal_date ?? null} />
            </div>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">MOT</p>
              {mot ? <MotDialog vehicleId={vehicle.id} record={mot} /> : null}
            </div>
            <p className="text-sm font-medium">{mot ? formatDate(mot.due_date) : "—"}</p>
            <div className="mt-1">
              <CountdownBadge date={mot?.due_date ?? null} />
            </div>
          </div>
          <div className="col-span-2 rounded-lg border border-border/60 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Road tax</p>
              {roadTax ? <RoadTaxDialog vehicleId={vehicle.id} record={roadTax} /> : null}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {roadTax?.price ? formatCurrency(roadTax.price) : "—"}
              </p>
              <CountdownBadge date={roadTax?.due_date ?? null} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <InsuranceDialog vehicleId={vehicle.id} />
          <MotDialog vehicleId={vehicle.id} />
          <RoadTaxDialog vehicleId={vehicle.id} />
          <MaintenanceDialog vehicleId={vehicle.id} />
        </div>

        {maintenance.length > 0 ? (
          <div>
            <Separator className="mb-3" />
            <p className="mb-2 text-xs font-medium text-muted-foreground">Maintenance log</p>
            <div className="flex flex-col">
              {maintenance.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-2 border-b border-border/50 py-2 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">
                      {TYPE_LABEL[entry.type]} · {formatDate(entry.performed_on)}
                    </p>
                    {entry.notes ? (
                      <p className="truncate text-xs text-muted-foreground">{entry.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.cost ? (
                      <span className="text-sm font-medium">{formatCurrency(entry.cost)}</span>
                    ) : null}
                    <MaintenanceDialog vehicleId={vehicle.id} entry={entry} />
                    <DeleteButton onDelete={() => deleteMaintenanceEntry(entry.id)} label="Delete entry" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
