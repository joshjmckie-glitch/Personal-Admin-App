"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CategoryGroup({
  label,
  count,
  totalLabel,
  defaultOpen = false,
  children,
}: {
  label: string;
  count: number;
  totalLabel?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", !open && "-rotate-90")}
          />
          <span className="text-sm font-medium">{label}</span>
          <Badge variant="secondary">{count}</Badge>
        </span>
        {totalLabel ? <span className="text-sm text-muted-foreground">{totalLabel}</span> : null}
      </button>
      {open ? <div className="pb-2 pl-6">{children}</div> : null}
    </div>
  );
}
