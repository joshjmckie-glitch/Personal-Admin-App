import type { MealSlot } from "@/lib/types/database";

export const MEAL_SLOT_ORDER: MealSlot[] = ["breakfast", "lunch", "tea"];

export const MEAL_SLOT_LABEL: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  tea: "Tea",
};
