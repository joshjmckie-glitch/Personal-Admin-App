import type { FitnessActivityType } from "@/lib/types/database";

export const ACTIVITY_LABEL: Record<FitnessActivityType, string> = {
  running: "Running",
  cycling: "Cycling",
  kettlebell: "Kettlebell",
  strength: "Strength",
  other: "Other",
};

export const ACTIVITY_ORDER: FitnessActivityType[] = [
  "running",
  "cycling",
  "kettlebell",
  "strength",
  "other",
];
