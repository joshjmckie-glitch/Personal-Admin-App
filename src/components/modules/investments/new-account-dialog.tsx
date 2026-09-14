"use client";

import { FormDialog } from "@/components/modules/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount } from "@/lib/actions/investments";

export function NewAccountDialog() {
  return (
    <FormDialog
      title="Add investment account"
      triggerLabel="Add account"
      submitLabel="Add account"
      onSubmit={createAccount}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Trading 212 ISA" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="provider">Provider</Label>
          <Select name="provider" defaultValue="other">
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
          <Select name="account_type" defaultValue="cash_savings">
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
    </FormDialog>
  );
}
