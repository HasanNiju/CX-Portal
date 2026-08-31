import { createClient } from "@/lib/supabase/server";
import { AgentsTable } from "./AgentsTable";

export default async function AgentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("role", me?.role === "super_admin" ? ["agent", "admin"] : ["agent"])
    .order("created_at", { ascending: false });

  return (
    <div className="animate-fade-up">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">People</p>
      <h1 className="font-display text-3xl font-semibold text-navy-ink tracking-tight">Agents & Admins</h1>
      <p className="mt-2 text-navy-ink-soft max-w-xl">
        Create accounts and manage access. New accounts default to Agent unless you're a Super Admin creating an Admin.
      </p>

      <AgentsTable initialProfiles={profiles || []} canCreateAdmin={me?.role === "super_admin"} />
    </div>
  );
}
