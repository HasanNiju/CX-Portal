"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function PresetActions({ content, presetId, canEdit }: { content: string; presetId: string; canEdit: boolean }) {
  const toast = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast("Preset copied.");
    } catch {
      toast("Couldn't copy — try again.", "bad");
    }
  };

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <Button onClick={copy}>Copy response</Button>
      <Link href={`/assistant?preset=${presetId}`}>
        <Button variant="secondary">Use in Assistant</Button>
      </Link>
      {canEdit && (
        <Link href={`/admin/presets/${presetId}`}>
          <Button variant="ghost">Edit</Button>
        </Link>
      )}
    </div>
  );
}
