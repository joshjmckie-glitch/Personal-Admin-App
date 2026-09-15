"use client";

import { Pencil } from "lucide-react";

import { FormDialog } from "@/components/modules/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount, updateAccount } from "@/lib/actions/investments";
import type { InvestmentAccountRow } from "@/lib/types/database";

export function NewAccountDialog({ account }: { account?: InvestmentAccountRow }) {
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
          <Select name="provider" defaultValue={account?.provider ?? "other"}>
            <SelectTrigger id="provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chase">Chase</SelectItem>
              <SelectItem value="moneybox">Moneybox</SelectItem>
              <SelectItem value="trading212">Trading 212</SelectItem>
              <SelectItem value="coinbase">Coinbase</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account_type">Type</Label>
          <Select name="account_type" defaultValue={account?.account_type ?? "cash_savings"}>
            <SelectTrigger id="account_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash_savings">Cash savings</SelectItem>
              <SelectItem value="isa">ISA</SelectItem>
              <SelectItem value="brokerage">Brokerage</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="pension">Pension</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
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
