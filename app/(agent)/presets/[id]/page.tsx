import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/session";
import { Badge } from "@/components/ui/Badge";
import { PresetActions } from "./PresetActions";

export default async function PresetDetailPage({ params }: { params: { id: string } }) {
  const { profile, supabase } = await getSessionProfile();

  const { data: preset } = await supabase.from("presets").select("*").eq("id", params.id).single();
  if (!preset) notFound();

  const { data: category } = preset.category_id
    ? await supabase.from("preset_categories").select("name").eq("id", preset.category_id).single()
    : { data: null };

  const canEdit = profile?.role === "admin" || profile?.role === "super_admin";

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-ink-soft mb-4">
        <Link href="/presets" className="focus-ring hover:text-ink">Presets</Link>
        <span>/</span>
        <span>{category?.name || "General"}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">{preset.title}</h1>
          {preset.short_description && <p className="mt-2 text-ink-soft">{preset.short_description}</p>}
        </div>
        <Badge>{preset.language.toUpperCase()}</Badge>
      </div>

      <div className="ticket-perf mt-6 rounded-card border border-line bg-surface px-6 pt-7 pb-6">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{preset.content}</p>
      </div>

      <PresetActions content={preset.content} presetId={preset.id} canEdit={canEdit} />
    </div>
  );
}
