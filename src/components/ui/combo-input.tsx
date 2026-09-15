"use client";

import { useId } from "react";

import { Input } from "@/components/ui/input";

/**
 * A free-text input with browser-native autocomplete suggestions — lets the
 * value be anything, but nudges toward previously-used or common options.
 * Use for fields that shouldn't be locked to a fixed set of choices.
 */
export function ComboInput({
  suggestions,
  ...props
}: React.ComponentProps<typeof Input> & { suggestions: string[] }) {
  const listId = useId();

  return (
    <>
      <Input {...props} list={listId} autoComplete="off" />
      <datalist id={listId}>
        {suggestions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
