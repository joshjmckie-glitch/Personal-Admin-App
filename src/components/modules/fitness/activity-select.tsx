"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ActivitySelect({ defaultValue = "running" }: { defaultValue?: string }) {
  return (
    <Select name="activity_type" defaultValue={defaultValue}>
      <SelectTrigger id="activity_type">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="running">Running</SelectItem>
        <SelectItem value="cycling">Cycling</SelectItem>
        <SelectItem value="kettlebell">Kettlebell</SelectItem>
        <SelectItem value="strength">Strength</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </SelectContent>
    </Select>
  );
}

export const ACTIVITY_LABEL: Record<string, string> = {
  running: "Running",
  cycling: "Cycling",
  kettlebell: "Kettlebell",
  strength: "Strength",
  other: "Other",
};
