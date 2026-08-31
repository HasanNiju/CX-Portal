"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Ticket } from "@/components/ui/Ticket";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { Preset, PresetCategory } from "@/lib/supabase/types";

export function PresetLibrary({ presets, categories }: { presets: Preset[]; categories: PresetCategory[] }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | "all">("all");
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
      toast("Preset copied.");
    } catch {
      toast("Couldn't copy — try again.", "bad");
    }
  };

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search presets…"
            className="focus-ring w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryId("all")}
            className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              categoryId === "all" ? "bg-ink text-white border-ink" : "border-line text-ink-soft hover:border-ink-faint"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                categoryId === c.id ? "bg-ink text-white border-ink" : "border-line text-ink-soft hover:border-ink-faint"
              }`}
            >
              {c.name}
            </button>
          ))}
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Ticket key={p.id} code={p.language.toUpperCase()} className="flex flex-col">
              <Badge>{catName(p.category_id)}</Badge>
              <Link href={`/presets/${p.id}`} className="mt-3 block">
                <h3 className="font-display text-base font-semibold text-ink line-clamp-1">{p.title}</h3>
              </Link>
              <p className="mt-1.5 text-sm text-ink-soft line-clamp-3 flex-1">
                {p.short_description || p.content}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/presets/${p.id}`}
                  className="focus-ring text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  View
                </Link>
                <span className="text-line">·</span>
                <button onClick={() => copy(p)} className="focus-ring text-sm font-semibold text-brand hover:text-brand-deep">
                  Copy
                </button>
              </div>
            </Ticket>
          ))}
        </div>
      )}
    </>
  );
}
