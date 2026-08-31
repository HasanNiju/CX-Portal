import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Ticket } from "@/components/ui/Ticket";

export default async function AdminDashboard() {
  const supabase = createClient();
  const [{ count: agentCount }, { count: presetCount }, { data: recentLogs }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "agent"),
    supabase.from("presets").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(6),
  ]);

  return (
    <div className="animate-fade-up">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">Management workspace</p>
      <h1 className="font-display text-3xl font-semibold text-navy-ink tracking-tight">Admin dashboard</h1>
      <p className="mt-2 text-navy-ink-soft max-w-xl">Manage the people and content agents rely on every day.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/agents">
          <Ticket dark code="TEAM" className="h-full">
            <p className="font-display text-3xl font-semibold text-navy-ink tabular-nums">{agentCount ?? "—"}</p>
            <p className="mt-1 text-sm text-navy-ink-soft">Active agents</p>
            <span className="mt-4 inline-block text-sm font-semibold text-brand">Manage agents →</span>
          </Ticket>
        </Link>
        <Link href="/admin/presets">
          <Ticket dark code="BANK" className="h-full">
            <p className="font-display text-3xl font-semibold text-navy-ink tabular-nums">{presetCount ?? "—"}</p>
            <p className="mt-1 text-sm text-navy-ink-soft">Live presets</p>
            <span className="mt-4 inline-block text-sm font-semibold text-brand">Manage presets →</span>
          </Ticket>
        </Link>
        <Ticket dark code="CONFIG" className="h-full">
          <p className="font-display text-base font-semibold text-navy-ink">Calculator rules</p>
          <p className="mt-1 text-sm text-navy-ink-soft">Business rules live in Supabase — edit calculator_configs directly for now.</p>
        </Ticket>
      </div>

      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft mb-3">Recent activity</p>
        {recentLogs && recentLogs.length > 0 ? (
          <div className="rounded-card border border-navy-line divide-y divide-navy-line overflow-hidden">
            {recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-navy-ink">{log.action}</span>
                <span className="font-mono text-xs text-navy-ink-soft">{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-navy-ink-soft">No administrative activity logged yet.</p>
        )}
      </div>
    </div>
  );
}
