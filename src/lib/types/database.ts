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
  overtime_amount: number | null;
  employer: string | null;
  notes: string | null;
  created_at: string;
};

export type FinanceCategory = "subscription" | "savings" | "rent" | "bills" | "fuel" | "other";
export type FinanceRecurringExpenseRow = {
  id: string;
  user_id: string;
  name: string;
  category: FinanceCategory;
  amount: number;
  active: boolean;
  billing_day: number | null;
  is_variable: boolean;
  notes: string | null;
  created_at: string;
};

export type FinanceExpenseLogRow = {
  id: string;
  user_id: string;
  expense_id: string;
  amount: number;
  logged_month: string;
  created_at: string;
};

export type PensionType = "none" | "salary_sacrifice" | "personal";
export type FinanceSalarySettingsRow = {
  id: string;
  user_id: string;
  annual_salary: number;
  pension_percent: number;
  pension_type: PensionType;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Investments
// ---------------------------------------------------------------------------
// provider and account_type are free text (not a fixed enum) — accounts get
// opened, closed and renamed often, so the UI offers suggestions from past
// entries rather than a hardcoded list.
export type InvestmentSyncMode = "manual" | "trading212" | "coinbase";

export type InvestmentAccountRow = {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  account_type: string;
  sync_mode: InvestmentSyncMode;
  current_value: number;
  currency: string;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type InvestmentContributionRow = {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  contributed_on: string;
  notes: string | null;
  created_at: string;
};

export type InvestmentHoldingRow = {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  quantity: number | null;
  value: number;
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

export type InvestmentConnectionEnvironment = "live" | "demo";
export type InvestmentConnectionRow = {
  id: string;
  user_id: string;
  account_id: string;
  provider: "trading212";
  environment: InvestmentConnectionEnvironment;
  api_key_secret_id: string;
  last_synced_at: string | null;
  last_sync_error: string | null;
  created_at: string;
};

// Shared reference cache (ticker -> trading currency) used to convert
// Trading 212 holding values into the account's currency — not per-user
// data, see supabase/migrations/0011_investment_instrument_currency_cache.sql.
export type InvestmentInstrumentCurrencyRow = {
  ticker: string;
  currency_code: string;
  updated_at: string;
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

export type CarRoadTaxRow = {
  id: string;
  user_id: string;
  vehicle_id: string;
  price: number | null;
  due_date: string;
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

export type GiftStatus = "idea" | "purchased";
export type GiftIdeaRow = {
  id: string;
  user_id: string;
  person_id: string;
  idea: string;
  expected_price: number | null;
  actual_price: number | null;
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
        "id" | "created_at" | "gross_amount" | "overtime_amount" | "employer" | "notes"
      >;
      finance_recurring_expenses: TableDef<
        FinanceRecurringExpenseRow,
        "id" | "created_at" | "active" | "billing_day" | "is_variable" | "notes"
      >;
      finance_expense_logs: TableDef<FinanceExpenseLogRow, "id" | "created_at" | "logged_month">;
      finance_salary_settings: TableDef<
        FinanceSalarySettingsRow,
        "id" | "created_at" | "updated_at" | "pension_percent" | "pension_type"
      >;
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
        | "archived"
      >;
      investment_contributions: TableDef<
        InvestmentContributionRow,
        "id" | "created_at" | "contributed_on" | "notes"
      >;
      investment_holdings: TableDef<
        InvestmentHoldingRow,
        "id" | "created_at" | "updated_at" | "quantity" | "notes"
      >;
      investment_value_history: TableDef<
        InvestmentValueHistoryRow,
        "id" | "created_at" | "recorded_at"
      >;
      investment_connections: TableDef<
        InvestmentConnectionRow,
        "id" | "created_at" | "last_synced_at" | "last_sync_error"
      >;
      investment_instrument_currency: TableDef<InvestmentInstrumentCurrencyRow, "updated_at">;
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
      car_road_tax: TableDef<CarRoadTaxRow, "id" | "created_at" | "price" | "notes">;
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
        "id" | "created_at" | "expected_price" | "actual_price" | "status" | "notes"
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      connect_trading212: {
        Args: {
          p_account_id: string;
          p_api_key: string;
          p_api_secret: string;
          p_environment: string;
        };
        Returns: string;
      };
      get_trading212_api_key: {
        Args: { p_account_id: string };
        Returns: {
          authorization_header: string;
          environment: InvestmentConnectionEnvironment;
          connection_id: string;
        }[];
      };
      disconnect_trading212: {
        Args: { p_account_id: string };
        Returns: undefined;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
