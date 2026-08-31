"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { Preset, PresetCategory } from "@/lib/supabase/types";

export function PresetLibrary({ presets, categories }: { presets: Preset[]; categories: PresetCategory[] }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const toast = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return presets.filter((p) => {
      if (categoryId !== "all" && p.category_id !== categoryId) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.short_description || "").toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [presets, query, categoryId]);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || "General";

  const copy = async (p: Preset) => {
    try {
      await navigator.clipboard.writeText(p.content);
      setCopiedId(p.id);
      toast("Copied — paste it in.");
      setTimeout(() => setCopiedId((id) => (id === p.id ? null : id)), 1800);
    } catch {
      toast("Couldn't copy — try again.", "bad");
    }
  };

  return (
    <>
      {/* Search + filters — sticky so they stay put while scrolling a long list */}
      <div className="sticky top-[57px] z-20 -mx-5 bg-paper/95 backdrop-blur px-5 py-3 mt-6 border-b border-line">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search presets…"
              className="focus-ring w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setCategoryId("all")}
              className={`focus-ring shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                categoryId === "all" ? "bg-ink text-white border-ink" : "border-line text-ink-soft hover:border-ink-faint"
              }`}
            >
              All ({presets.length})
            </button>
            {categories.map((c) => {
              const count = presets.filter((p) => p.category_id === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`focus-ring shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    categoryId === c.id ? "bg-ink text-white border-ink" : "border-line text-ink-soft hover:border-ink-faint"
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No presets match that search"
            description="Try a different keyword, or clear the category filter."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((p) => (
            <div key={p.id} className="ticket-perf rounded-card border border-line bg-surface flex flex-col">
              <div className="px-5 pt-6 pb-1 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge>{catName(p.category_id)}</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{p.language}</span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-ink">{p.title}</h3>
                  {p.short_description && <p className="mt-0.5 text-sm text-ink-soft">{p.short_description}</p>}
                </div>
              </div>

              <div className="mx-5 mt-3 mb-4 flex-1 rounded-xl bg-paper border border-line px-4 py-3 max-h-40 overflow-y-auto scrollbar-thin">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{p.content}</p>
              </div>

              <div className="px-5 pb-5 flex items-center gap-3">
                <button
                  onClick={() => copy(p)}
                  className={`focus-ring inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    copiedId === p.id ? "bg-good text-white" : "bg-brand text-white hover:bg-brand-deep"
                  }`}
                >
                  {copiedId === p.id ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5"/></svg>
                      Copied
                    </>
                  ) : (
                    "Copy"
                  )}
                </button>
                <Link href={`/assistant?preset=${p.id}`} className="focus-ring text-sm font-semibold text-ink-soft hover:text-ink">
                  Ask assistant
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
