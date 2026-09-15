# Life Admin

A personal life-admin dashboard — Finances, Investments, Fitness, Car, Recipes & Meal Prep, Travel, and Gifts — built as a mobile-first installable PWA on Next.js + Supabase.

## Stack

- **Next.js (App Router)** + TypeScript, Tailwind CSS v4
- **shadcn-style UI kit** (Radix UI primitives, hand-rolled in `src/components/ui`)
- **Supabase**: Postgres + Auth + Storage, Row Level Security enabled on every table from day one
- **Recharts** for the investment value trend
- **PWA**: web app manifest + a hand-written service worker (installable to a phone home screen)

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migrations in order:
   - `supabase/migrations/0001_init.sql` — all module tables, RLS policies, and the `profiles` table + auto-create trigger.
   - `supabase/migrations/0002_storage.sql` — the `recipe-photos` storage bucket and its access policies.
3. Under **Authentication → Providers**, email/password should already be enabled. This app has no public sign-up page — create your own account under **Authentication → Users → Add user** (or via the Supabase CLI). A `profiles` row is created for you automatically by a database trigger.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your project's URL and anon key (Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run it

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign in with the account you created in Supabase.

To install as a PWA: open the deployed HTTPS URL on a phone and use "Add to Home Screen" (iOS Safari) or the install prompt (Android Chrome). The service worker only registers in production builds (`npm run build && npm start`).

## Architecture

- **Row Level Security everywhere.** Every table has a `user_id` column and an "owner only" RLS policy (select/insert/update/delete restricted to `auth.uid() = user_id`). This means the multi-tenant model is already correct even though only one account exists today — adding real sign-up later needs no data-layer changes.
- **Module registry.** Each life area is self-contained: its own Supabase table(s), its own route under `src/app/(app)/<module>/`, its own components under `src/components/modules/<module>/`, and one dashboard widget. Two small files tie it all together:
  - `src/lib/modules/registry.ts` — nav metadata (label, route, icon) for the sidebar/bottom nav and dashboard grid.
  - `src/lib/modules/widgets.tsx` — maps each module id to its dashboard widget component.

  **To add a new module:** create its Supabase table(s) + RLS policies (a new migration file), its folder under `src/app/(app)/<id>/` and `src/components/modules/<id>/`, then add one entry to `registry.ts` and one to `widgets.tsx`. Nothing else changes.
- **Auth.** `src/proxy.ts` (Next.js 16's renamed `middleware.ts`) refreshes the Supabase session and redirects unauthenticated requests to `/login`. There is no public registration screen — accounts are provisioned directly in Supabase.
- **Theming.** Dark (default) and light themes are defined as CSS variables in `src/app/globals.css`, matching the brief's charcoal/gold and off-white/gold palettes. The toggle uses `next-themes` (instant, no flash) and mirrors the choice to `profiles.theme_preference` for cross-device reference.
- **Edit everywhere.** Every module supports edit in place, not just add/delete — the same dialog component is reused for both by passing it an existing row (e.g. `<NewPaycheckDialog paycheck={p} />`); the dialog switches its title, submit action, and pre-filled values accordingly.
- **Delete confirmation.** The shared `DeleteButton` (`src/components/modules/delete-button.tsx`) shows an inline confirm popover before calling its delete action — this is the single place that behaviour lives, so every module gets it for free.

## Salary & tax estimate (Finances)

Set your annual salary and pension contribution under Finances → Salary & Tax to get an estimated UK take-home breakdown (income tax, National Insurance, pension) and a monthly expected figure. Each paycheck can log one-off overtime/extra pay, which adjusts that month's expected take-home for comparison against what you actually log as the paycheck's net amount.

- Calculation lives in `src/lib/tax/uk-tax.ts` — England/Wales/NI rates only (Scotland has different bands, not modelled), current tax year's bands hardcoded with a comment to update annually.
- It's a simplified PAYE estimate: standard tax code, one job, no student loan, no benefits-in-kind. Treat it as a planning guide, not a payslip.
- Schema: `finance_salary_settings` (one row per user) and `finance_paychecks.overtime_amount`, added in `supabase/migrations/0003_salary_settings.sql`.

## Recurring monthly expenses (Finances)

Finances → Expenses is a standing list of monthly outgoings — subscriptions, and transfers into savings pots (insurance, golf membership, holiday fund, etc.) — set up once rather than re-entered per paycheck. Each has a name, category, monthly amount, and an active/paused toggle (pause instead of delete for something you're skipping this month but will resume). Every paycheck card shows the total of currently-active expenses against that paycheck's net amount.

This replaced an earlier per-paycheck "line item" design (`finance_line_items`, dropped in `supabase/migrations/0004_recurring_expenses.sql`) that required re-adding the same recurring costs under every single paycheck — the new `finance_recurring_expenses` table is a single standing list instead.

## Live API integrations (not yet wired up)

Per the build brief, these are deliberately left for later, once manual entry is solid:

- **Investments**: `investment_accounts.sync_mode` already supports `trading212` / `coinbase` values; the accounts UI just doesn't fetch from those APIs yet.
- **Fitness**: `fitness_sessions.source` already supports `strava` for when Strava sync is added.
- **Car**: DVLA Vehicle Enquiry Service auto-fill (backlog).
- **Gifts**: web-powered search for photos/price/options per idea (backlog).

## Project structure

```
src/
  app/
    login/                  Public login route (email/password)
    (app)/                  Authenticated route group — sidebar/bottom-nav shell
      page.tsx              Dashboard (widget grid)
      finances/ investments/ fitness/ car/ recipes/ travel/ gifts/
    manifest.ts             PWA manifest
  components/
    ui/                     Design-system primitives (button, card, dialog, ...)
    layout/                 Sidebar, bottom nav, topbar, theme toggle
    dashboard/              Widget card shell
    modules/<id>/           Per-module UI (forms, lists, widget)
  lib/
    supabase/               Browser/server Supabase clients + session refresh
    modules/                Module registry + widget map
    actions/                Server actions (one file per module)
    types/database.ts       Hand-written Supabase Database types
supabase/migrations/        SQL migrations (run in order)
```
