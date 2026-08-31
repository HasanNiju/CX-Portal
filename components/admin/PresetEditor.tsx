"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Preset, PresetCategory } from "@/lib/supabase/types";
import type { PresetFormState } from "@/lib/presets/actions";

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : label}</Button>;
}

export function PresetEditor({
  preset,
  categories,
  action,
}: {
  preset?: Preset;
  categories: PresetCategory[];
  action: (state: PresetFormState, formData: FormData) => Promise<PresetFormState>;
}) {
  const [state, formAction] = useFormState(action, {});
  const [content, setContent] = useState(preset?.content || "");

  return (
    <form action={formAction} className="mt-6 grid gap-6 lg:grid-cols-2 items-start">
      <div className="space-y-4 rounded-card border border-navy-line bg-navy-surface p-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">Title</label>
          <input
            name="title" defaultValue={preset?.title} required
            className="focus-ring mt-1.5 w-full rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">Short description</label>
          <input
            name="short_description" defaultValue={preset?.short_description || ""}
            className="focus-ring mt-1.5 w-full rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">Category</label>
            <select name="category_id" defaultValue={preset?.category_id || ""} className="focus-ring mt-1.5 w-full rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink">
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">Language</label>
            <select name="language" defaultValue={preset?.language || "bn"} className="focus-ring mt-1.5 w-full rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink">
              <option value="bn">Bangla</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">Tags (comma separated)</label>
          <input
            name="tags" defaultValue={preset?.tags?.join(", ") || ""}
            className="focus-ring mt-1.5 w-full rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft">Content</label>
          <textarea
            name="content" required rows={10} value={content} onChange={(e) => setContent(e.target.value)}
            className="focus-ring mt-1.5 w-full rounded-lg border border-navy-line bg-navy px-3 py-2 text-sm text-navy-ink resize-y"
          />
        </div>
        {preset && (
          <label className="flex items-center gap-2 text-sm text-navy-ink-soft">
            <input type="checkbox" name="is_active" defaultChecked={preset.is_active} className="accent-brand" />
            Active (visible to agents)
          </label>
        )}

        {state?.error && <p className="text-sm text-brand">{state.error}</p>}
        <SaveButton label={preset ? "Save changes" : "Create preset"} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-ink-soft mb-2">Live preview</p>
        <div className="ticket-perf rounded-card border border-navy-line bg-navy-surface px-6 pt-7 pb-6">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-navy-ink">{content || "Content preview appears here…"}</p>
        </div>
      </div>
    </form>
  );
}
