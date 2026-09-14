import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ email, children }: { email: string; children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={email} />
        <main className="flex-1 px-4 pt-4 pb-20 md:px-6 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
