"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTIVITY_LABEL, ACTIVITY_ORDER } from "@/lib/modules/fitness-activities";

export function ActivitySelect({ defaultValue = "running" }: { defaultValue?: string }) {
  return (
    <Select name="activity_type" defaultValue={defaultValue}>
      <SelectTrigger id="activity_type">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ACTIVITY_ORDER.map((activity) => (
          <SelectItem key={activity} value={activity}>
            {ACTIVITY_LABEL[activity]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
