"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { updateThemePreference } from "@/lib/actions/profile";

const noopSubscribe = () => () => {};

// Avoids a hydration mismatch: the server always renders the "not mounted"
// icon, and the real theme-dependent icon appears only once client state
// (from localStorage, via next-themes) is available.
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  function toggle() {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
    void updateThemePreference(next);
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
