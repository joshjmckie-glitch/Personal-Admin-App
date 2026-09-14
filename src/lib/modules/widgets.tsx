import type { ComponentType } from "react";

import { FinancesWidget } from "@/components/modules/finances/widget";
import { InvestmentsWidget } from "@/components/modules/investments/widget";
import { FitnessWidget } from "@/components/modules/fitness/widget";
import { CarWidget } from "@/components/modules/car/widget";
import { RecipesWidget } from "@/components/modules/recipes/widget";
import { TravelWidget } from "@/components/modules/travel/widget";
import { GiftsWidget } from "@/components/modules/gifts/widget";

/**
 * Maps each module id (see src/lib/modules/registry.ts) to the server
 * component that renders its dashboard summary. Adding a module means
 * adding one entry here alongside its registry entry.
 */
export const MODULE_WIDGETS: Record<string, ComponentType> = {
  finances: FinancesWidget,
  investments: InvestmentsWidget,
  fitness: FitnessWidget,
  car: CarWidget,
  recipes: RecipesWidget,
  travel: TravelWidget,
  gifts: GiftsWidget,
};
