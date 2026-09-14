"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";

import { MODULES } from "@/lib/modules/registry";
import { cn } from "@/lib/utils";

// Primary tabs on mobile: dashboard + the first few modules. Every module is
// still reachable from the "More" grid the dashboard links to, so this list
// can stay short without any module going missing.
const PRIMARY_IDS = ["finances", "investments", "fitness", "car"];

export function BottomNav() {
  const pathname = usePathname();
  const primary = MODULES.filter((m) => PRIMARY_IDS.includes(m.id));

  const items = [
    { href: "/", label: "Home", icon: LayoutGrid },
    ...primary.map((m) => ({ href: m.href, label: m.label, icon: m.icon })),
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-sidebar-border bg-sidebar/95 backdrop-blur px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              active ? "text-primary" : "text-sidebar-foreground/60"
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
