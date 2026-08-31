import { createClient } from "@/lib/supabase/server";
import { CalculatorWorkspace } from "./CalculatorWorkspace";

export default async function CalculatorPage() {
  const supabase = createClient();
  const { data: config } = await supabase
    .from("calculator_configs")
    .select("*")
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="animate-fade-up">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">Calculator</p>
      <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">Delivery fee estimate</h1>
      <p className="mt-2 text-ink-soft max-w-xl">Pick zones, weight, and merchant type — the estimate updates instantly.</p>

      {config ? (
        <CalculatorWorkspace config={config.config_json} />
      ) : (
        <p className="mt-8 text-sm text-bad">Calculator configuration isn't available right now.</p>
      )}
    </div>
  );
}
