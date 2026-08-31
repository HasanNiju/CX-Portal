import Link from "next/link";
import { getSessionProfile } from "@/lib/supabase/session";
import { HomeFeature } from "@/components/home/HomeFeature";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const { user, profile, supabase } = await getSessionProfile();
  const { count: presetCount } = await supabase
    .from("presets")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="animate-fade-up">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand mb-2">
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
        {greeting()}, {firstName}.
      </h1>
      <p className="mt-2 text-ink-soft max-w-xl">
        Here's your workspace — jump into presets, run a quick calculation, or ask the assistant.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HomeFeature
          href="/presets"
          icon="library"
          title="Preset Bank"
          description="Search and copy support responses by category, tag, or language."
          meta={`${presetCount ?? "—"} live`}
        />
        <HomeFeature
          href="/calculator"
          icon="calculator"
          title="Calculator"
          description="Estimate delivery charges by zone, weight, merchant type, and COD."
          meta="ISD · OSD · Suburb"
        />
        <HomeFeature
          href="/assistant"
          icon="sparkles"
          title="AI Assistant"
          description="Ask for the right preset, rewrite a reply, or explain a calculator result."
          meta="Powered by Gemini"
        />
      </div>
    </div>
  );
}
