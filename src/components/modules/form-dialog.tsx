"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FormDialog({
  title,
  triggerLabel,
  trigger,
  children,
  onSubmit,
  submitLabel = "Save",
}: {
  title: string;
  triggerLabel?: string;
  trigger?: ReactNode;
  children: ReactNode;
  // Server Actions redact every thrown error's message in production (Next
  // can't tell a safe error from one leaking secrets), so an action that
  // needs a real message on failure must return { error } instead of
  // throwing — this stays optional so actions that just throw still work
  // exactly as before, they simply keep the generic fallback message.
  onSubmit: (formData: FormData) => Promise<void | { error: string }>;
  submitLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await onSubmit(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="secondary">
            <Plus />
            {triggerLabel ?? "Add"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {children}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
