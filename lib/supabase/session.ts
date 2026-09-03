import { cache } from "react";
import { createClient } from "./server";
import type { Profile } from "./types";

// Dedupe the "who is this + what's their profile" fetch across every
// Server Component in a single request, AND avoid a second network
// round-trip that middleware already paid for.
//
// Middleware validates the session with supabase.auth.getUser() — a
// network call to Supabase Auth that revalidates the JWT — before any
// protected route is allowed through. Re-doing that same network call
// again inside the page (which this used to do) doubles the auth
// latency on every single navigation for no extra security, since
// middleware already gated the request. getSession() reads the
// already-validated session from the cookie locally (no network call),
// which is safe here specifically because middleware is the real
// gatekeeper — this helper is never the only line of defense.
export const getSessionProfile = cache(async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) return { user: null, profile: null as Profile | null, supabase };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return { user, profile: profile as Profile | null, supabase };
});
