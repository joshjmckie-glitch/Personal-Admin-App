"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComboInput } from "@/components/ui/combo-input";
import { createAccount, updateAccount } from "@/lib/actions/investments";
import type { InvestmentAccountRow } from "@/lib/types/database";

export function NewAccountDialog({
  account,
  providerSuggestions,
  typeSuggestions,
}: {
  account?: InvestmentAccountRow;
  providerSuggestions: string[];
  typeSuggestions: string[];
}) {
  const isEdit = Boolean(account);

  return (
    <FormDialog
      title={isEdit ? "Edit account" : "Add investment account"}
      submitLabel={isEdit ? "Save changes" : "Add account"}
      triggerLabel={isEdit ? undefined : "Add account"}
      trigger={
        isEdit ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Edit account">
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
        ) : undefined
      }
      onSubmit={(formData) =>
        isEdit ? updateAccount(account!.id, formData) : createAccount(formData)
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Trading 212 ISA" defaultValue={account?.name} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="provider">Provider</Label>
          <ComboInput
            id="provider"
            name="provider"
            required
            placeholder="Trading 212"
            defaultValue={account?.provider}
            suggestions={providerSuggestions}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account_type">Type</Label>
          <ComboInput
            id="account_type"
            name="account_type"
            required
            placeholder="Stocks & shares"
            defaultValue={account?.account_type}
            suggestions={typeSuggestions}
          />
        </div>
      </div>
      {isEdit ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={account?.currency ?? "GBP"} maxLength={3} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current_value">Current value</Label>
            <Input id="current_value" name="current_value" type="number" step="0.01" required placeholder="5000" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue="GBP" maxLength={3} />
          </div>
        </div>
      )}
      {isEdit ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" name="notes" defaultValue={account?.notes ?? undefined} />
        </div>
      ) : null}
      {isEdit ? (
        <p className="text-xs text-muted-foreground">
          To change the current value, use &ldquo;Log value&rdquo; on the account card instead —
          that keeps the value history and trend chart accurate.
        </p>
      ) : null}
    </FormDialog>
  );
}
