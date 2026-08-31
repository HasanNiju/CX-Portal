"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type Msg = { role: "user" | "assistant"; content: string; usedPresets?: string[] };

const STARTERS = [
  "Help me respond to this customer.",
  "Find the right preset for this issue.",
  "Explain this calculator result.",
  "Rewrite this response professionally.",
];

export function AssistantWorkspace({ presetId }: { presetId?: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presetContext, setPresetContext] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!presetId) return;
    const supabase = createClient();
    supabase.from("presets").select("title,content").eq("id", presetId).single().then(({ data }) => {
      if (data) {
        setPresetContext(data.content);
        setInput(`Help me tailor this preset — "${data.title}" — to my customer's message: `);
      }
    });
  }, [presetId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, presetContext }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply, usedPresets: data.usedPresets }]);
      }
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setMessages([]);
    setError(null);
    setPresetContext(null);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied.");
    } catch {
      toast("Couldn't copy — try again.", "bad");
    }
  };

  return (
    <div className="flex flex-1 flex-col rounded-card border border-line bg-surface overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <p className="font-display text-lg font-semibold text-ink">What do you need help with?</p>
            <p className="mt-1.5 text-sm text-ink-soft max-w-sm">Try one of these, or type your own question below.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2 max-w-lg w-full">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="focus-ring rounded-xl border border-line bg-paper px-4 py-3 text-left text-sm text-ink-soft hover:border-brand hover:text-ink transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`group max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user" ? "bg-ink text-white" : "bg-paper border border-line text-ink"
              }`}
            >
              {m.content}
              {m.role === "assistant" && !!m.usedPresets?.length && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.usedPresets.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                      From: {t}
                    </span>
                  ))}
                </div>
              )}
              {m.role === "assistant" && (
                <button
                  onClick={() => copy(m.content)}
                  className="focus-ring mt-2 block text-xs font-semibold text-ink-faint opacity-0 group-hover:opacity-100 hover:text-brand transition-opacity"
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-line bg-paper px-4 py-3">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-pulse [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-pulse [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-brand/30 bg-brand-wash px-4 py-3 text-sm text-brand-deep flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => send(messages[messages.length - 1]?.content || "")} className="font-semibold underline shrink-0">
              Retry
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t border-line bg-surface p-3 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ask the assistant…"
          rows={1}
          className="focus-ring flex-1 resize-none rounded-xl border border-line bg-paper px-4 py-3 text-sm max-h-32"
        />
        {messages.length > 0 && (
          <Button type="button" variant="ghost" onClick={clear}>New</Button>
        )}
        <Button type="submit" disabled={loading || !input.trim()}>Send</Button>
      </form>
    </div>
  );
}
