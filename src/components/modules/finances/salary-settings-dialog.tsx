"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveSalarySettings } from "@/lib/actions/finances";
import type { FinanceSalarySettingsRow } from "@/lib/types/database";

/** A day-of-month (1-31) as a same-month date string, for the date input's defaultValue. */
function dayToDate(day: number) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const clamped = Math.min(day, daysInMonth);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}

export function SalarySettingsDialog({ settings }: { settings: FinanceSalarySettingsRow | null }) {
  return (
    <FormDialog
      title="Salary & pension"
      submitLabel="Save"
      trigger={
        <Button type="button" variant="secondary" size="sm">
          <Pencil />
          {settings ? "Edit salary" : "Set up salary"}
        </Button>
      }
      onSubmit={saveSalarySettings}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="annual_salary">Annual salary (gross)</Label>
        <Input
          id="annual_salary"
          name="annual_salary"
          type="number"
          step="0.01"
          required
          placeholder="45000"
          defaultValue={settings?.annual_salary}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pension_type">Pension</Label>
        <Select name="pension_type" defaultValue={settings?.pension_type ?? "none"}>
          <SelectTrigger id="pension_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No pension contribution</SelectItem>
            <SelectItem value="salary_sacrifice">Salary sacrifice (via employer)</SelectItem>
            <SelectItem value="personal">Personal / relief-at-source</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Salary sacrifice lowers your taxable pay (reduces tax + NI). A personal pension comes
          out of your take-home pay after tax.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pension_percent">Pension contribution (% of salary)</Label>
        <Input
          id="pension_percent"
          name="pension_percent"
          type="number"
          step="0.1"
          min="0"
          max="100"
          placeholder="5"
          defaultValue={settings?.pension_percent}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pay_day">Pay day (optional)</Label>
        <Input
          id="pay_day"
          name="pay_day"
          type="date"
          defaultValue={settings?.pay_day ? dayToDate(settings.pay_day) : undefined}
        />
        <p className="text-xs text-muted-foreground">
          Pick any date — we&rsquo;ll just use the day of the month. If it falls on a weekend or UK
          bank holiday, we&rsquo;ll count down to the working day before instead.
        </p>
      </div>
    </FormDialog>
  );
}
