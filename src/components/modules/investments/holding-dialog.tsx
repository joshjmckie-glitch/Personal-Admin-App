"use client";

import { Plus, Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHolding, updateHolding } from "@/lib/actions/investments";
import type { InvestmentHoldingRow } from "@/lib/types/database";

export function HoldingDialog({
  accountId,
  holding,
}: {
  accountId: string;
  holding?: InvestmentHoldingRow;
}) {
  const isEdit = Boolean(holding);

  return (
    <FormDialog
      title={isEdit ? "Edit holding" : "Add holding"}
      submitLabel={isEdit ? "Save changes" : "Add holding"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit holding">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm">
            <Plus />
            Add holding
          </Button>
        )
      }
      onSubmit={(formData) =>
        isEdit ? updateHolding(holding!.id, formData) : createHolding(accountId, formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name / ticker</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="AAPL, Bitcoin, S&P 500 ETF…"
          defaultValue={holding?.name}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">Quantity (optional)</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="any"
            placeholder="0.05"
            defaultValue={holding?.quantity ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            required
            placeholder="1200"
            defaultValue={holding?.value}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" name="notes" defaultValue={holding?.notes ?? undefined} />
      </div>
    </FormDialog>
  );
}
