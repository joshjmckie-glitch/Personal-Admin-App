export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Insert types are derived from Row by making OptionalKeys (columns with a
// database default or that are nullable) optional; every other Row field is
// required on insert. Update makes every field optional.
type TableDef<Row, OptionalKeys extends keyof Row = never> = {
  Row: Row;
  Insert: Omit<Row, OptionalKeys> & Partial<Pick<Row, OptionalKeys>>;
  Update: Partial<Row>;
  Relationships: [];
};

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------
export type ProfileRow = {
  id: string;
  full_name: string | null;
  theme_preference: "dark" | "light";
  created_at: string;
};

// ---------------------------------------------------------------------------
// Finances
// ---------------------------------------------------------------------------
export type FinancePaycheckRow = {
  id: string;
  user_id: string;
  pay_date: string;
  net_amount: number;
  gross_amount: number | null;
  employer: string | null;
  notes: string | null;
  created_at: string;
};

export type FinanceCategory = "subscription" | "savings" | "rent" | "bills" | "other";
export type FinanceLineItemRow = {
  id: string;
  user_id: string;
  paycheck_id: string;
  category: FinanceCategory;
  name: string;
  amount: number;
  is_recurring: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Investments
// ---------------------------------------------------------------------------
export type InvestmentProvider = "chase" | "moneybox" | "trading212" | "coinbase" | "other";
export type InvestmentAccountType =
  | "cash_savings"
  | "isa"
  | "brokerage"
  | "crypto"
  | "pension"
  | "other";
export type InvestmentSyncMode = "manual" | "trading212" | "coinbase";

export type InvestmentAccountRow = {
  id: string;
  user_id: string;
  name: string;
  provider: InvestmentProvider;
  account_type: InvestmentAccountType;
  sync_mode: InvestmentSyncMode;
  current_value: number;
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InvestmentValueHistoryRow = {
  id: string;
  user_id: string;
  account_id: string;
  value: number;
  recorded_at: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Fitness
// ---------------------------------------------------------------------------
export type FitnessActivityType = "running" | "cycling" | "kettlebell" | "strength" | "other";
export type FitnessGoalStatus = "active" | "completed" | "abandoned";

export type FitnessGoalRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: FitnessGoalStatus;
  created_at: string;
};

export type FitnessSessionRow = {
  id: string;
  user_id: string;
  activity_type: FitnessActivityType;
  scheduled_date: string;
  duration_minutes: number | null;
  distance_km: number | null;
  notes: string | null;
  completed: boolean;
  source: "manual" | "strava";
  created_at: string;
};

export type FitnessPersonalBestRow = {
  id: string;
  user_id: string;
  activity_type: FitnessActivityType;
  metric: string;
  value: string;
  achieved_on: string;
  notes: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Car
// ---------------------------------------------------------------------------
export type CarVehicleRow = {
  id: string;
  user_id: string;
  make: string | null;
  model: string | null;
  registration: string | null;
  year: number | null;
  notes: string | null;
  created_at: string;
};

export type CarInsuranceRow = {
  id: string;
  user_id: string;
  vehicle_id: string;
  provider: string | null;
  price: number | null;
  renewal_date: string;
  notes: string | null;
  created_at: string;
};

export type CarMotRow = {
  id: string;
  user_id: string;
  vehicle_id: string;
  due_date: string;
  last_pass_date: string | null;
  notes: string | null;
  created_at: string;
};

export type CarMaintenanceType = "service" | "tyre_change" | "repair";
export type CarMaintenanceLogRow = {
  id: string;
  user_id: string;
  vehicle_id: string;
  type: CarMaintenanceType;
  performed_on: string;
  cost: number | null;
  mileage: number | null;
  notes: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Recipes & meal prep
// ---------------------------------------------------------------------------
export type RecipeRow = {
  id: string;
  user_id: string;
  title: string;
  ingredients: string;
  method: string;
  tags: string[];
  photo_url: string | null;
  created_at: string;
};

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";
export type MealPlanEntryRow = {
  id: string;
  user_id: string;
  recipe_id: string | null;
  title_override: string | null;
  planned_date: string;
  meal_slot: MealSlot;
  notes: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Travel
// ---------------------------------------------------------------------------
export type TravelTripRow = {
  id: string;
  user_id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
};

export type TravelPackingItemRow = {
  id: string;
  user_id: string;
  trip_id: string;
  item: string;
  category: string | null;
  packed: boolean;
  created_at: string;
};

export type TravelItineraryItemRow = {
  id: string;
  user_id: string;
  trip_id: string;
  item_date: string;
  item_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  created_at: string;
};

export type TravelCostCategory =
  | "flights"
  | "hotel"
  | "food"
  | "transport"
  | "activities"
  | "other";
export type TravelCostRow = {
  id: string;
  user_id: string;
  trip_id: string;
  category: TravelCostCategory;
  description: string | null;
  amount: number;
  currency: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Gifts
// ---------------------------------------------------------------------------
export type GiftPersonRow = {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  created_at: string;
};

export type GiftStatus = "idea" | "purchased" | "given";
export type GiftIdeaRow = {
  id: string;
  user_id: string;
  person_id: string;
  idea: string;
  expected_price: number | null;
  status: GiftStatus;
  notes: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, "full_name" | "theme_preference" | "created_at">;
      finance_paychecks: TableDef<
        FinancePaycheckRow,
        "id" | "created_at" | "gross_amount" | "employer" | "notes"
      >;
      finance_line_items: TableDef<FinanceLineItemRow, "id" | "created_at" | "is_recurring">;
      investment_accounts: TableDef<
        InvestmentAccountRow,
        | "id"
        | "created_at"
        | "updated_at"
        | "provider"
        | "account_type"
        | "sync_mode"
        | "currency"
        | "notes"
      >;
      investment_value_history: TableDef<
        InvestmentValueHistoryRow,
        "id" | "created_at" | "recorded_at"
      >;
      fitness_goals: TableDef<
        FitnessGoalRow,
        "id" | "created_at" | "description" | "target_date" | "status"
      >;
      fitness_sessions: TableDef<
        FitnessSessionRow,
        "id" | "created_at" | "duration_minutes" | "distance_km" | "notes" | "completed" | "source"
      >;
      fitness_personal_bests: TableDef<
        FitnessPersonalBestRow,
        "id" | "created_at" | "notes" | "achieved_on"
      >;
      car_vehicles: TableDef<
        CarVehicleRow,
        "id" | "created_at" | "make" | "model" | "registration" | "year" | "notes"
      >;
      car_insurance: TableDef<CarInsuranceRow, "id" | "created_at" | "provider" | "price" | "notes">;
      car_mot: TableDef<CarMotRow, "id" | "created_at" | "last_pass_date" | "notes">;
      car_maintenance_log: TableDef<
        CarMaintenanceLogRow,
        "id" | "created_at" | "cost" | "mileage" | "notes"
      >;
      recipes: TableDef<
        RecipeRow,
        "id" | "created_at" | "ingredients" | "method" | "tags" | "photo_url"
      >;
      meal_plan_entries: TableDef<
        MealPlanEntryRow,
        "id" | "created_at" | "recipe_id" | "title_override" | "meal_slot" | "notes"
      >;
      travel_trips: TableDef<
        TravelTripRow,
        "id" | "created_at" | "destination" | "start_date" | "end_date" | "notes"
      >;
      travel_packing_items: TableDef<
        TravelPackingItemRow,
        "id" | "created_at" | "category" | "packed"
      >;
      travel_itinerary_items: TableDef<
        TravelItineraryItemRow,
        "id" | "created_at" | "item_time" | "description" | "location"
      >;
      travel_costs: TableDef<
        TravelCostRow,
        "id" | "created_at" | "category" | "description" | "currency"
      >;
      gift_people: TableDef<GiftPersonRow, "id" | "created_at" | "notes">;
      gift_ideas: TableDef<
        GiftIdeaRow,
        "id" | "created_at" | "expected_price" | "status" | "notes"
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
