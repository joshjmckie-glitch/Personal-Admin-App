import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  TrendingUp,
  Activity,
  Car,
  ChefHat,
  Plane,
  Gift,
} from "lucide-react";

/**
 * Central module registry. Every life-admin area is registered here once —
 * its nav entry, icon, and route. To add a new module: create its folder
 * under src/app/(app)/<id>/ and src/components/modules/<id>/, then add one
 * entry here (and one entry in src/lib/modules/widgets.tsx for its
 * dashboard widget). Nothing else in the app needs to change.
 */
export interface ModuleDef {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const MODULES: ModuleDef[] = [
  {
    id: "finances",
    label: "Finances",
    href: "/finances",
    icon: Wallet,
    description: "Per-paycheck breakdown",
  },
  {
    id: "investments",
    label: "Investments",
    href: "/investments",
    icon: TrendingUp,
    description: "Accounts & holdings",
  },
  {
    id: "fitness",
    label: "Fitness",
    href: "/fitness",
    icon: Activity,
    description: "Goals, schedule & PBs",
  },
  {
    id: "car",
    label: "Car",
    href: "/car",
    icon: Car,
    description: "Insurance, MOT & servicing",
  },
  {
    id: "meals",
    label: "Meals",
    href: "/meals",
    icon: ChefHat,
    description: "Meal library & meal plan",
  },
  {
    id: "travel",
    label: "Travel",
    href: "/travel",
    icon: Plane,
    description: "Trips, packing & itinerary",
  },
  {
    id: "gifts",
    label: "Gifts",
    href: "/gifts",
    icon: Gift,
    description: "Gift ideas by person",
  },
];
