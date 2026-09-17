import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { CountdownBadge } from "@/components/modules/car/countdown-badge";
import { formatCurrency } from "@/lib/utils";

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

  const [{ data: mot }, { data: insurance }, { data: roadTax }, { data: carExpenses }] = await Promise.all([
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
    supabase
      .from("finance_recurring_expenses")
      .select("id, name, amount, is_variable")
      .eq("show_on_car_widget", true)
      .eq("active", true),
  ]);

  const variableIds = (carExpenses ?? []).filter((e) => e.is_variable).map((e) => e.id);
  let logCountByExpense = new Map<string, number>();
  if (variableIds.length > 0) {
    const { data: logs } = await supabase
      .from("finance_expense_logs")
      .select("expense_id")
      .in("expense_id", variableIds);
    logCountByExpense = (logs ?? []).reduce((map, log) => {
      map.set(log.expense_id, (map.get(log.expense_id) ?? 0) + 1);
      return map;
    }, new Map<string, number>());
  }

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

        {(carExpenses ?? []).map((expense) => (
          <div
            key={expense.id}
            className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm"
          >
            <span>{expense.name}</span>
            <span className="text-right">
              <span className="font-semibold">
                {expense.is_variable ? "~" : ""}
                {formatCurrency(expense.amount)}/mo
              </span>
              {expense.is_variable ? (
                <span className="block text-xs text-muted-foreground">
                  {logCountByExpense.get(expense.id) ?? 0} logged
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}
