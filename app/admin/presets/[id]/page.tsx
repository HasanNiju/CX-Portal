import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresetEditor } from "@/components/admin/PresetEditor";
import { updatePreset } from "@/lib/presets/actions";

export default async function EditPresetPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: preset }, { data: categories }] = await Promise.all([
    supabase.from("presets").select("*").eq("id", params.id).single(),
    supabase.from("preset_categories").select("*").order("sort_order"),
  ]);
  if (!preset) notFound();

  const boundUpdate = updatePreset.bind(null, preset.id);

  return (
    <div className="animate-fade-up">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">Edit preset</p>
      <h1 className="font-display text-3xl font-semibold text-navy-ink tracking-tight">{preset.title}</h1>
      <PresetEditor preset={preset} categories={categories || []} action={boundUpdate} />
    </div>
  );
}
