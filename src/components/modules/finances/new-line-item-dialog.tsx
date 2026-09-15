"use client";

import { Plus, Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLineItem, updateLineItem } from "@/lib/actions/finances";
import type { FinanceLineItemRow } from "@/lib/types/database";

export function NewLineItemDialog({
  paycheckId,
  lineItem,
}: {
  paycheckId: string;
  lineItem?: FinanceLineItemRow;
}) {
  const isEdit = Boolean(lineItem);

  return (
    <FormDialog
      title={isEdit ? "Edit line item" : "Add line item"}
      submitLabel={isEdit ? "Save changes" : "Add item"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" className="size-6" aria-label="Edit item">
            <Pencil className="size-3.5 text-muted-foreground" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="sm">
            <Plus />
            Add item
          </Button>
        )
      }
      onSubmit={(formData) =>
        isEdit ? updateLineItem(lineItem!.id, formData) : createLineItem(paycheckId, formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={lineItem?.category ?? "subscription"}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="subscription">Subscription</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="bills">Bills</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Netflix" defaultValue={lineItem?.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          required
          placeholder="12.99"
          defaultValue={lineItem?.amount}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="is_recurring" name="is_recurring" defaultChecked={lineItem?.is_recurring ?? true} />
        <Label htmlFor="is_recurring" className="font-normal">
          Recurring cost
        </Label>
      </div>
    </FormDialog>
  );
}
