"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";

import { MODULES } from "@/lib/modules/registry";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 md:flex">
      <div className="flex items-center gap-2 px-2 py-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <LayoutGrid className="size-4" />
        </div>
        <span className="text-sm font-semibold text-sidebar-foreground">Life Admin</span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1">
        <SidebarLink href="/" label="Dashboard" icon={LayoutGrid} active={pathname === "/"} />
        <div className="my-2 h-px bg-sidebar-border" />
        {MODULES.map((mod) => (
          <SidebarLink
            key={mod.id}
            href={mod.href}
            label={mod.label}
            icon={mod.icon}
            active={pathname === mod.href || pathname.startsWith(`${mod.href}/`)}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
