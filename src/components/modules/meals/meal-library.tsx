"use client";

import { useMemo, useState } from "react";

import { MealFormDialog } from "@/components/modules/meals/meal-form-dialog";
import { MealCard } from "@/components/modules/meals/meal-card";
import { MEAL_SLOT_ORDER, MEAL_SLOT_LABEL } from "@/lib/modules/meal-slots";
import { cn } from "@/lib/utils";
import type { MealSlot, RecipeRow } from "@/lib/types/database";

export function MealLibrary({ meals }: { meals: RecipeRow[] }) {
  const [activeTypes, setActiveTypes] = useState<MealSlot[]>([]);

  const filtered = useMemo(() => {
    if (activeTypes.length === 0) return meals;
    return meals.filter((meal) => meal.meal_type.some((t) => activeTypes.includes(t)));
  }, [meals, activeTypes]);

  function toggleType(slot: MealSlot) {
    setActiveTypes((prev) => (prev.includes(slot) ? prev.filter((t) => t !== slot) : [...prev, slot]));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All" active={activeTypes.length === 0} onClick={() => setActiveTypes([])} />
          {MEAL_SLOT_ORDER.map((slot) => (
            <FilterChip
              key={slot}
              label={MEAL_SLOT_LABEL[slot]}
              active={activeTypes.includes(slot)}
              onClick={() => toggleType(slot)}
            />
          ))}
        </div>
        <MealFormDialog />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          {meals.length === 0 ? "No meals yet. Add your first one." : "No meals match this filter."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
