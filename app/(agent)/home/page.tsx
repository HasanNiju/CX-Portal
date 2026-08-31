import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Ticket } from "@/components/ui/Ticket";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
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

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/presets" className="group">
          <Ticket code={`${presetCount ?? "—"} LIVE`} className="h-full transition-transform group-hover:-translate-y-0.5">
            <h2 className="font-display text-xl font-semibold text-ink">Preset Bank</h2>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">
              Browse and copy support responses by category, tag, or language.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              Open library
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </Ticket>
        </Link>

        <Link href="/calculator" className="group">
          <Ticket code="ISD · OSD · SUB" className="h-full transition-transform group-hover:-translate-y-0.5">
            <h2 className="font-display text-xl font-semibold text-ink">Calculator</h2>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">
              Estimate delivery charges by zone, weight, merchant type, and COD.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              Run a calculation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </Ticket>
        </Link>

        <Link href="/assistant" className="group">
          <Ticket code="AI" className="h-full transition-transform group-hover:-translate-y-0.5">
            <h2 className="font-display text-xl font-semibold text-ink">AI Assistant</h2>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">
              Ask for the right preset, rewrite a reply, or explain a calculator result.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              Start a conversation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </span>
          </Ticket>
        </Link>
      </div>
    </div>
  );
}
