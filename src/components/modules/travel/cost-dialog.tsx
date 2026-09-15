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
import { createCost, updateCost } from "@/lib/actions/travel";
import type { TravelCostRow } from "@/lib/types/database";

const CATEGORY_LABEL: Record<string, string> = {
  flights: "Flights",
  hotel: "Hotel",
  food: "Food",
  transport: "Transport",
  activities: "Activities",
  other: "Other",
};

export function CostDialog({ tripId, cost }: { tripId: string; cost?: TravelCostRow }) {
  const isEdit = Boolean(cost);

  return (
    <FormDialog
      title={isEdit ? "Edit cost" : "Add cost"}
      submitLabel={isEdit ? "Save changes" : "Add"}
      triggerLabel={isEdit ? undefined : "Add cost"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit cost">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) => (isEdit ? updateCost(cost!.id, tripId, formData) : createCost(tripId, formData))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={cost?.category ?? "flights"}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Return flights"
          defaultValue={cost?.description ?? undefined}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" step="0.01" required defaultValue={cost?.amount} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={cost?.currency ?? "GBP"} maxLength={3} />
        </div>
      </div>
    </FormDialog>
  );
}
