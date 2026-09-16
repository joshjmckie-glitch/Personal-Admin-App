import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { CountdownBadge } from "@/components/modules/car/countdown-badge";

function CarSilhouette() {
  return (
    <svg viewBox="0 0 240 100" className="h-20 w-full text-primary" aria-hidden="true">
      <path
        d="M14,72 L14,56 C14,51 19,50 24,50 L44,50 C54,35 76,21 100,21 L140,21 C156,21 167,31 172,46 L196,46 C207,46 214,51 214,60 L214,72"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="14" y1="72" x2="214" y2="72" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="48" cy="73" r="15" fill="var(--color-card)" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="180" cy="73" r="15" fill="var(--color-card)" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );
}

export async function CarStatusHero() {
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("car_vehicles")
    .select("id, make, model, registration")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!vehicle) return null;

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

  const title = [vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Your car";

  return (
    <Link href="/car" className="block">
      <div className="rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {vehicle.registration ? (
            <span className="rounded-sm bg-[#f5c518] px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-black">
              {vehicle.registration}
            </span>
          ) : null}
        </div>

        <CarSilhouette />

        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tax</p>
            <CountdownBadge date={roadTax?.due_date ?? null} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">MOT</p>
            <CountdownBadge date={mot?.due_date ?? null} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Insurance</p>
            <CountdownBadge date={insurance?.renewal_date ?? null} />
          </div>
        </div>
      </div>
    </Link>
  );
}
