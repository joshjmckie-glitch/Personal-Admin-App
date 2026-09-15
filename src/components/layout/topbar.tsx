"use client";

import { usePathname } from "next/navigation";

import { MODULES } from "@/lib/modules/registry";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Topbar({ email }: { email: string }) {
  const pathname = usePathname();
  const active = MODULES.find(
    (m) => pathname === m.href || pathname.startsWith(`${m.href}/`)
  );
  const title = active?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <h1 className="text-sm font-semibold text-foreground/90 md:text-base">{title}</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu email={email} />
        </div>
      </div>
    </header>
  );
}
