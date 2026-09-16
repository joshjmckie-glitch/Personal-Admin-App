"use client";

import { Plug } from "lucide-react";

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
import { connectTrading212 } from "@/lib/actions/trading212";

export function Trading212ConnectDialog({ accountId }: { accountId: string }) {
  return (
    <FormDialog
      title="Connect Trading 212"
      submitLabel="Connect"
      trigger={
        <Button type="button" variant="secondary" size="sm">
          <Plug />
          Connect Trading 212
        </Button>
      }
      onSubmit={(formData) => connectTrading212(accountId, formData)}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="api_key">API key</Label>
        <Input id="api_key" name="api_key" type="password" required placeholder="Paste your API key" />
        <p className="text-xs text-muted-foreground">
          Generate one in the Trading 212 app under Settings → API (Open API).
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="environment">Account type</Label>
        <Select name="environment" defaultValue="live">
          <SelectTrigger id="environment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="demo">Practice / demo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FormDialog>
  );
}
