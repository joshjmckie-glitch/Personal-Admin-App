"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteButton } from "@/components/modules/delete-button";
import { NewMealDialog } from "@/components/modules/recipes/new-meal-dialog";
import { deleteMealPlanEntry } from "@/lib/actions/recipes";
import { cn } from "@/lib/utils";
import type { MealPlanEntryRow, RecipeRow } from "@/lib/types/database";

type Entry = MealPlanEntryRow & { recipe_title: string | null };

const SLOT_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
const SLOT_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function MealPlanner({
  entries,
  recipes,
}: {
  entries: Entry[];
  recipes: Pick<RecipeRow, "id" | "title">[];
}) {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [anchor, setAnchor] = useState(() => new Date());

  const entriesByDate = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of entries) {
      const list = map.get(entry.planned_date) ?? [];
      list.push(entry);
      map.set(entry.planned_date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => SLOT_ORDER.indexOf(a.meal_slot) - SLOT_ORDER.indexOf(b.meal_slot));
    }
    return map;
  }, [entries]);

  function navigate(dir: -1 | 1) {
    setAnchor((prev) =>
      view === "day" ? addDays(prev, dir) : view === "week" ? addWeeks(prev, dir) : addMonths(prev, dir)
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
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

      {view === "day" && <DayView date={anchor} entriesByDate={entriesByDate} recipes={recipes} />}
      {view === "week" && <WeekView date={anchor} entriesByDate={entriesByDate} recipes={recipes} />}
      {view === "month" && (
        <MonthView
          date={anchor}
          entriesByDate={entriesByDate}
          onSelectDay={(d) => {
            setAnchor(d);
            setView("day");
          }}
        />
      )}
    </div>
  );
}

function DayCell({
  date,
  entries,
  recipes,
}: {
  date: Date;
  entries: Entry[];
  recipes: Pick<RecipeRow, "id" | "title">[];
}) {
  const dateStr = format(date, "yyyy-MM-dd");

  return (
    <div className="flex flex-col gap-1.5">
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No meals planned</p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-1 rounded-md bg-secondary px-2 py-1"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {entry.recipe_title ?? entry.title_override ?? "Meal"}
              </p>
              <p className="text-[10px] text-muted-foreground">{SLOT_LABEL[entry.meal_slot]}</p>
            </div>
            <DeleteButton onDelete={() => deleteMealPlanEntry(entry.id)} label="Remove meal" />
          </div>
        ))
      )}
      <NewMealDialog date={dateStr} recipes={recipes} />
    </div>
  );
}

function DayView({
  date,
  entriesByDate,
  recipes,
}: {
  date: Date;
  entriesByDate: Map<string, Entry[]>;
  recipes: Pick<RecipeRow, "id" | "title">[];
}) {
  const dateStr = format(date, "yyyy-MM-dd");
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <p className="mb-3 text-sm font-semibold">{format(date, "EEEE d MMMM")}</p>
      <DayCell date={date} entries={entriesByDate.get(dateStr) ?? []} recipes={recipes} />
    </div>
  );
}

function WeekView({
  date,
  entriesByDate,
  recipes,
}: {
  date: Date;
  entriesByDate: Map<string, Entry[]>;
  recipes: Pick<RecipeRow, "id" | "title">[];
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
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              {format(day, "EEE d")}
            </p>
            <DayCell date={day} entries={entriesByDate.get(dateStr) ?? []} recipes={recipes} />
          </div>
        );
      })}
    </div>
  );
}

function MonthView({
  date,
  entriesByDate,
  onSelectDay,
}: {
  date: Date;
  entriesByDate: Map<string, Entry[]>;
  onSelectDay: (d: Date) => void;
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  });

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
          const count = entriesByDate.get(dateStr)?.length ?? 0;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border border-transparent text-xs",
                isSameMonth(day, date) ? "text-foreground" : "text-muted-foreground/40",
                isToday(day) && "border-primary/60",
                isSameDay(day, date) && "bg-secondary"
              )}
            >
              {format(day, "d")}
              {count > 0 && <span className="size-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
