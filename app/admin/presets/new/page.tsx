import { createClient } from "@/lib/supabase/server";
import { PresetEditor } from "@/components/admin/PresetEditor";
import { createPreset } from "@/lib/presets/actions";

export default async function NewPresetPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("preset_categories").select("*").order("sort_order");

  return (
    <div className="animate-fade-up">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">New preset</p>
      <h1 className="font-display text-3xl font-semibold text-navy-ink tracking-tight">Create a preset</h1>
      <PresetEditor categories={categories || []} action={createPreset} />
    </div>
  );
}
