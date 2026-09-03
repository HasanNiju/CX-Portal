import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MODEL = "gemini-3.6-flash";

async function findRelevantPresets(supabase: ReturnType<typeof createClient>, question: string) {
  // Ranked full-text search (Postgres tsvector/websearch_to_tsquery) —
  // finds presets by meaning-adjacent keyword overlap and ranks by
  // relevance, instead of the old crude ILIKE-per-word matching.
  const { data, error } = await supabase.rpc("search_presets", {
    search_query: question,
    match_count: 6,
  });

  if (!error && data && data.length > 0) return data;

  // Fallback for edge cases where websearch_to_tsquery finds nothing
  // (e.g. a query that's only stopwords/punctuation after parsing) —
  // crude keyword ILIKE still catches something rather than nothing.
  const words = question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 8);

  if (words.length === 0) return [];

  const { data: fallback } = await supabase
    .from("presets")
    .select("title, short_description, content, tags")
    .eq("is_active", true)
    .or(words.map((w) => `title.ilike.%${w}%,short_description.ilike.%${w}%,content.ilike.%${w}%`).join(","))
    .limit(6);

  return fallback || [];
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The AI assistant isn't configured yet. Set GEMINI_API_KEY on the server." },
      { status: 503 }
    );
  }

  const { messages, presetContext } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";
  const matches = await findRelevantPresets(supabase, lastUserMessage);

  const presetBlock = matches.length
    ? matches
        .map((p: any) => `Title: ${p.title}${p.short_description ? ` (${p.short_description})` : ""}\n${p.content}`)
        .join("\n\n---\n\n")
    : null;

  const systemPrompt = [
    "You are the CX Portal Assistant for Pathao customer-support agents.",
    "Your job is to ground replies in the company's approved preset responses below, not to write generic answers from general knowledge.",
    "",
    "Rules for using presets:",
    "1. If one or more presets below are a good match for the situation, base your reply directly on the best-matching preset's wording and structure. Lightly adapt it — fill in specifics the agent mentioned (names, order numbers, exact issue), adjust tone slightly if needed — but keep it recognizably the same approved response, not a rewrite from scratch.",
    "2. If multiple presets are relevant (e.g. an apology plus a hold message), you may combine them naturally into one coherent reply.",
    "3. If none of the presets genuinely fit the situation, say so briefly and then write a professional reply in the same tone the presets use — do not force-fit an unrelated preset.",
    "4. Keep the reply ready to paste directly into a live chat unless the agent explicitly asks for an explanation or something longer.",
    "5. Preserve the preset's original language (Bangla presets stay in Bangla, English presets stay in English) unless the agent asks for a translation.",
    presetBlock ? `Presets that may be relevant to this question, ranked by relevance:\n\n${presetBlock}` : "No presets matched this question closely — answer using general professional support judgment instead.",
    presetContext ? `The agent is directly referencing this preset — treat it as the primary basis for your reply:\n${presetContext}` : "",
  ].filter(Boolean).join("\n\n");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: messages.map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: "The assistant couldn't respond. Try again.", detail }, { status: 502 });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";
    if (!text) {
      return NextResponse.json({ error: "The assistant didn't return a response. Try rephrasing." }, { status: 502 });
    }
    return NextResponse.json({ reply: text, usedPresets: matches.map((m: any) => m.title) });
  } catch {
    return NextResponse.json({ error: "The assistant couldn't respond. Try again." }, { status: 502 });
  }
}