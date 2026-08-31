import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function AdminPresetsPage() {
  const supabase = createClient();
  const { data: presets } = await supabase.from("presets").select("*, preset_categories(name)").order("sort_order");

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">Content</p>
          <h1 className="font-display text-3xl font-semibold text-navy-ink tracking-tight">Presets</h1>
          <p className="mt-2 text-navy-ink-soft max-w-xl">Create, edit, and archive the responses agents use.</p>
        </div>
        <Link href="/admin/presets/new"><Button>New preset</Button></Link>
      </div>

      <div className="mt-6 rounded-card border border-navy-line overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-line text-left text-xs uppercase tracking-wide text-navy-ink-soft">
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-line">
            {(presets || []).map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-navy-ink font-medium">{p.title}</td>
                <td className="px-4 py-3 text-navy-ink-soft hidden sm:table-cell">{p.preset_categories?.name || "—"}</td>
                <td className="px-4 py-3"><Badge tone={p.is_active ? "good" : "neutral"}>{p.is_active ? "Active" : "Archived"}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/presets/${p.id}`} className="focus-ring text-xs font-semibold text-brand hover:text-brand-deep">Edit</Link>
                </td>
              </tr>
            ))}
            {(!presets || presets.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-navy-ink-soft">No presets yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
