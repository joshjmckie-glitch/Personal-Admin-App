"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const TickButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { checked: boolean }
>(({ checked, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-pressed={checked}
    className={cn(
      "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
      checked
        ? "border-primary bg-primary text-primary-foreground"
        : "border-input text-transparent hover:border-primary/60",
      className
    )}
    {...props}
  >
    <Check className="size-3.5" />
  </button>
));
TickButton.displayName = "TickButton";
