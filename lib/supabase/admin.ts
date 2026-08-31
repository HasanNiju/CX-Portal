import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client. SERVER ONLY — never import this from a
// Client Component or anything shipped to the browser. Only used
// inside app/api/admin/* route handlers, which independently check
// the caller's role before doing anything privileged.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
