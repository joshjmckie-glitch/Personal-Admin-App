"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
import { ChevronLeft, ChevronRight, ChefHat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteButton } from "@/components/modules/delete-button";
import { PlanEntryDialog } from "@/components/modules/meals/plan-entry-dialog";
import { deleteMealPlanEntry } from "@/lib/actions/meals";
import { MEAL_SLOT_ORDER, MEAL_SLOT_LABEL } from "@/lib/modules/meal-slots";
import { cn } from "@/lib/utils";
import type { MealPlanEntryRow, RecipeRow } from "@/lib/types/database";

type Entry = MealPlanEntryRow & { meal_title: string | null; meal_photo_url: string | null };
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

/** A meal's photo as a small rounded thumbnail, or a generic fallback icon when it has none. */
function MealThumb({ photoUrl, size }: { photoUrl: string | null; size: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-md bg-secondary ring-2 ring-card"
      style={{ width: size, height: size }}
    >
      {photoUrl ? (
        <Image src={photoUrl} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <ChefHat style={{ width: size * 0.55, height: size * 0.55 }} />
        </div>
      )}
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

        if (!entry) {
          return (
            <div key={slot} className="rounded-lg border border-dashed border-border px-2.5 py-1.5">
              <PlanEntryDialog
                date={dateStr}
                slot={slot}
                meals={meals}
                trigger={
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
                    + Add {MEAL_SLOT_LABEL[slot]}
                  </button>
                }
              />
            </div>
          );
        }

        return (
          <div key={slot} className="relative flex items-center gap-2 rounded-lg bg-secondary py-1.5 pr-2 pl-9">
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
              <MealThumb photoUrl={entry.meal_photo_url} size={26} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{MEAL_SLOT_LABEL[slot]}</p>
              <p className="truncate text-xs font-medium">{entry.meal_title ?? entry.title_override ?? "Meal"}</p>
            </div>
            <DeleteButton
              onDelete={() => deleteMealPlanEntry(entry.id)}
              label={`Remove ${MEAL_SLOT_LABEL[slot]}`}
            />
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
          const dayEntries = (entriesByDate.get(dateStr) ?? [])
            .slice()
            .sort((a, b) => MEAL_SLOT_ORDER.indexOf(a.meal_slot) - MEAL_SLOT_ORDER.indexOf(b.meal_slot));
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
              {dayEntries.length > 0 ? (
                <div className="flex">
                  {dayEntries.map((entry, i) => (
                    <div key={entry.id} className={i > 0 ? "-ml-2" : undefined}>
                      <MealThumb photoUrl={entry.meal_photo_url} size={18} />
                    </div>
                  ))}
                </div>
              ) : null}
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
