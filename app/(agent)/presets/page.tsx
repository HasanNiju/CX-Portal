import { createClient } from "@/lib/supabase/server";
import { PresetLibrary } from "./PresetLibrary";

export default async function PresetsPage() {
  const supabase = createClient();
  const [{ data: presets }, { data: categories }] = await Promise.all([
    supabase.from("presets").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("preset_categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <div className="animate-fade-up">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">Preset Bank</p>
      <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">Support responses</h1>
      <p className="mt-2 text-ink-soft max-w-xl">Search, filter, and copy — no chat should start from a blank line.</p>

      <PresetLibrary presets={presets || []} categories={categories || []} />
    </div>
  );
}
