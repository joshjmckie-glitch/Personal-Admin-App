import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already redirects unauthenticated requests to /login; this is
  // a defensive fallback for any route rendered without going through it.
  if (!user) {
    redirect("/login");
  }

  return <AppShell email={user.email ?? "Account"}>{children}</AppShell>;
}
