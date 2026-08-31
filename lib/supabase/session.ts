import { cache } from "react";
import { createClient } from "./server";
import type { Profile } from "./types";

// Dedupe the "who is this + what's their profile" fetch across every
// Server Component in a single request. Before this, the layout, the
// page, and sometimes a child component each called
// supabase.auth.getUser() + a profiles query independently — 2-3
// redundant round-trips to Supabase on every single page load. React's
// cache() makes repeated calls within one request reuse the same
// in-flight promise instead of firing new network requests.
export const getSessionProfile = cache(async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null, supabase };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { user, profile: profile as Profile | null, supabase };
});
