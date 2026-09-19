"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteButton } from "@/components/modules/delete-button";
import { PlanEntryDialog } from "@/components/modules/meals/plan-entry-dialog";
import { deleteMealPlanEntry } from "@/lib/actions/meals";
import { MEAL_SLOT_ORDER, MEAL_SLOT_LABEL } from "@/lib/modules/meal-slots";
import { cn } from "@/lib/utils";
import type { MealPlanEntryRow, RecipeRow } from "@/lib/types/database";

type Entry = MealPlanEntryRow & { meal_title: string | null };
type MealOption = Pick<RecipeRow, "id" | "title" | "meal_type">;

export function MealPlanner({
  entries,
  meals,
}: {
  entries: Entry[];
  meals: MealOption[];
}) {
  const [view, setView] = useState<"week" | "month">("week");
  const [anchor, setAnchor] = useState(() => new Date());

  const entriesByDate = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of entries) {
      const list = map.get(entry.planned_date) ?? [];
      list.push(entry);
      map.set(entry.planned_date, list);
    }
    return map;
  }, [entries]);

  function navigate(dir: -1 | 1) {
    setAnchor((prev) => (view === "week" ? addWeeks(prev, dir) : addMonths(prev, dir)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Previous">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)} aria-label="Next">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {view === "week" && <WeekView date={anchor} entriesByDate={entriesByDate} meals={meals} />}
      {view === "month" && <MonthView date={anchor} entriesByDate={entriesByDate} meals={meals} />}
    </div>
  );
}

function DaySlots({
  date,
  entriesByDate,
  meals,
}: {
  date: Date;
  entriesByDate: Map<string, Entry[]>;
  meals: MealOption[];
}) {
  const dateStr = format(date, "yyyy-MM-dd");
  const entries = entriesByDate.get(dateStr) ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      {MEAL_SLOT_ORDER.map((slot) => {
        const entry = entries.find((e) => e.meal_slot === slot);
        return (
          <div key={slot} className="flex items-center justify-between gap-1 rounded-md bg-secondary px-2 py-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground">{MEAL_SLOT_LABEL[slot]}</p>
              {entry ? (
                <p className="truncate text-xs font-medium">
                  {entry.meal_title ?? entry.title_override ?? "Meal"}
                </p>
              ) : (
                <PlanEntryDialog
                  date={dateStr}
                  slot={slot}
                  meals={meals}
                  trigger={
                    <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
                      + Add
                    </button>
                  }
                />
              )}
            </div>
            {entry ? (
              <DeleteButton
                onDelete={() => deleteMealPlanEntry(entry.id)}
                label={`Remove ${MEAL_SLOT_LABEL[slot]}`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function WeekView({
  date,
  entriesByDate,
  meals,
}: {
  date: Date;
  entriesByDate: Map<string, Entry[]>;
  meals: MealOption[];
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return (
          <div
            key={dateStr}
            className={cn(
              "rounded-xl border border-border/60 bg-card p-3",
              isToday(day) && "border-primary/50"
            )}
          >
            <p className="mb-2 text-xs font-semibold text-muted-foreground">{format(day, "EEE d")}</p>
            <DaySlots date={day} entriesByDate={entriesByDate} meals={meals} />
          </div>
        );
      })}
    </div>
  );
}

function MonthView({
  date,
  entriesByDate,
  meals,
}: {
  date: Date;
  entriesByDate: Map<string, Entry[]>;
  meals: MealOption[];
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{format(date, "MMMM yyyy")}</p>
      <div className="grid grid-cols-7 gap-1.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEntries = entriesByDate.get(dateStr) ?? [];
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => setExpandedDay(day)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-transparent text-xs",
                isSameMonth(day, date) ? "text-foreground" : "text-muted-foreground/40",
                isToday(day) && "border-primary/60"
              )}
            >
              {format(day, "d")}
              <div className="flex gap-0.5">
                {MEAL_SLOT_ORDER.map((slot) => (
                  <span
                    key={slot}
                    className={cn(
                      "size-1.5 rounded-full",
                      dayEntries.some((e) => e.meal_slot === slot) ? "bg-primary" : "bg-border"
                    )}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={expandedDay !== null} onOpenChange={(open) => !open && setExpandedDay(null)}>
        <DialogContent>
          {expandedDay ? (
            <>
              <DialogHeader>
                <DialogTitle>{format(expandedDay, "EEEE d MMMM")}</DialogTitle>
              </DialogHeader>
              <DaySlots date={expandedDay} entriesByDate={entriesByDate} meals={meals} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
