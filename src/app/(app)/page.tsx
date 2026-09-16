import { Suspense } from "react";

import { MODULES } from "@/lib/modules/registry";
import { MODULE_WIDGETS } from "@/lib/modules/widgets";
import { WidgetCard, WidgetSkeleton } from "@/components/dashboard/widget-card";
import { CarStatusHero } from "@/components/modules/car/car-status-hero";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Suspense fallback={null}>
        <CarStatusHero />
      </Suspense>

      <div>
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Everything at a glance. Tap a card to open that module.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MODULES.map((mod) => {
          const Widget = MODULE_WIDGETS[mod.id];
          return (
            <WidgetCard key={mod.id} href={mod.href} label={mod.label} icon={mod.icon}>
              <Suspense fallback={<WidgetSkeleton />}>
                <Widget />
              </Suspense>
            </WidgetCard>
          );
        })}
      </div>
    </div>
  );
}
