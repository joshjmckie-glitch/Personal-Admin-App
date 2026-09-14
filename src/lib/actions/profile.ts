"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateThemePreference(theme: "dark" | "light") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("profiles")
    .update({ theme_preference: theme })
    .eq("id", user.id);
}
