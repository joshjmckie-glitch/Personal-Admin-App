"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bulkAddMealPlanEntries, checkMealPlanConflicts } from "@/lib/actions/meals";
import { MEAL_SLOT_ORDER, MEAL_SLOT_LABEL } from "@/lib/modules/meal-slots";
import { cn, formatDate } from "@/lib/utils";
import type { MealSlot, RecipeRow } from "@/lib/types/database";

type MealOption = Pick<RecipeRow, "id" | "title" | "meal_type">;

export function PlanEntryDialog({
  date,
  slot,
  meals,
  trigger,
}: {
  date: string;
  slot: MealSlot;
  meals: MealOption[];
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[] | null>(null);

  const [query, setQuery] = useState("");
  const [onlyThisType, setOnlyThisType] = useState(true);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [mealSlot, setMealSlot] = useState<MealSlot>(slot);
  const [startDate, setStartDate] = useState(date);
  const [endDate, setEndDate] = useState(date);

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      if (onlyThisType && meal.meal_type.length > 0 && !meal.meal_type.includes(mealSlot)) return false;
      if (query.trim() && !meal.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [meals, onlyThisType, mealSlot, query]);

  function reset() {
    setQuery("");
    setOnlyThisType(true);
    setSelectedMealId(null);
    setCustomName("");
    setMealSlot(slot);
    setStartDate(date);
    setEndDate(date);
    setConflicts(null);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function submit() {
    setError(null);
    if (!selectedMealId && !customName.trim()) {
      setError("Pick a meal or enter a custom meal name");
      return;
    }
    if (endDate < startDate) {
      setError("End date can't be before the start date");
      return;
    }

    startTransition(async () => {
      const result = await checkMealPlanConflicts({ meal_slot: mealSlot, start_date: startDate, end_date: endDate });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if (result.conflicts.length > 0) {
        setConflicts(result.conflicts);
        return;
      }
      await commit();
    });
  }

  async function commit() {
    const result = await bulkAddMealPlanEntries({
      meal_id: selectedMealId,
      title_override: selectedMealId ? null : customName.trim() || null,
      meal_slot: mealSlot,
      start_date: startDate,
      end_date: endDate,
    });
    if (result?.error) {
      setError(result.error);
      return;
    }
    handleOpenChange(false);
  }

  function confirmOverwrite() {
    startTransition(commit);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="ghost" size="icon" className="size-6">
            <Plus className="size-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        {conflicts ? (
          <>
            <DialogHeader>
              <DialogTitle>Overwrite existing plans?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {MEAL_SLOT_LABEL[mealSlot]} is already planned on:
            </p>
            <ul className="flex flex-col gap-1 text-sm">
              {conflicts.map((d) => (
                <li key={d}>{formatDate(d)}</li>
              ))}
            </ul>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setConflicts(null)} disabled={pending}>
                Back
              </Button>
              <Button type="button" onClick={confirmOverwrite} disabled={pending}>
                {pending ? "Saving…" : "Overwrite"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add to meal plan</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan_meal_slot">Meal type</Label>
                <Select value={mealSlot} onValueChange={(v) => setMealSlot(v as MealSlot)}>
                  <SelectTrigger id="plan_meal_slot">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_SLOT_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {MEAL_SLOT_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="plan_start">Start date</Label>
                  <Input
                    id="plan_start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="plan_end">End date</Label>
                  <Input id="plan_end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="plan_search">Meal</Label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox checked={onlyThisType} onCheckedChange={(v) => setOnlyThisType(Boolean(v))} />
                    Only {MEAL_SLOT_LABEL[mealSlot]}
                  </label>
                </div>
                <Input
                  id="plan_search"
                  placeholder="Search meals…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="flex max-h-40 flex-col overflow-y-auto rounded-lg border border-border">
                  {filteredMeals.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-muted-foreground">No meals match</p>
                  ) : (
                    filteredMeals.map((meal) => (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => {
                          setSelectedMealId(meal.id === selectedMealId ? null : meal.id);
                          setCustomName("");
                        }}
                        className={cn(
                          "border-b border-border/60 px-3 py-2 text-left text-sm last:border-b-0",
                          selectedMealId === meal.id ? "bg-primary/15 font-medium" : "hover:bg-secondary"
                        )}
                      >
                        {meal.title}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plan_custom">Or custom meal name</Label>
                <Input
                  id="plan_custom"
                  placeholder="Leftovers"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    if (e.target.value) setSelectedMealId(null);
                  }}
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <DialogFooter>
                <Button type="button" onClick={submit} disabled={pending}>
                  {pending ? "Checking…" : "Add"}
                </Button>
              </DialogFooter>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
