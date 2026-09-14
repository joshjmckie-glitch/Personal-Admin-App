"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteButton({
  onDelete,
  label = "Delete",
}: {
  onDelete: () => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await onDelete();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete");
          }
        })
      }
    >
      <Trash2 className="size-4 text-muted-foreground" />
    </Button>
  );
}
