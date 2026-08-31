import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";

export default async function SuperAdminPage() {
  const supabase = createClient();
  const { data: admins } = await supabase.from("profiles").select("*").eq("role", "admin").order("created_at", { ascending: false });
  const { data: auditLogs } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(20);

  return (
    <div className="animate-fade-up">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">Privileged controls</p>
      <h1 className="font-display text-3xl font-semibold text-navy-ink tracking-tight">Super Admin</h1>
      <p className="mt-2 text-navy-ink-soft max-w-xl">
        Create Admin accounts from the <span className="text-navy-ink font-medium">Agents & Admins</span> page — as
        Super Admin, a role selector appears there. This page covers what only Super Admin can see.
      </p>

      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft mb-3">Admins ({admins?.length ?? 0})</p>
        <div className="rounded-card border border-navy-line overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-line text-left text-xs uppercase tracking-wide text-navy-ink-soft">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-line">
              {(admins || []).map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-navy-ink font-medium">{a.full_name}</td>
                  <td className="px-4 py-3 text-navy-ink-soft">{a.email}</td>
                  <td className="px-4 py-3"><Badge tone={a.status === "active" ? "good" : "neutral"}>{a.status}</Badge></td>
                </tr>
              ))}
              {(!admins || admins.length === 0) && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-navy-ink-soft">No admins yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft mb-3">Audit log</p>
        {auditLogs && auditLogs.length > 0 ? (
          <div className="rounded-card border border-navy-line divide-y divide-navy-line overflow-hidden">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-navy-ink">{log.action}</span>
                <span className="font-mono text-xs text-navy-ink-soft">{new Date(log.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-navy-ink-soft">Nothing logged yet.</p>
        )}
      </div>
    </div>
  );
}
