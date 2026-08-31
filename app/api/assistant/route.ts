import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MODEL = "gemini-3.6-flash";

async function findRelevantPresets(supabase: ReturnType<typeof createClient>, question: string) {
  const words = question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 8);

  if (words.length === 0) return [];

  const { data } = await supabase
    .from("presets")
    .select("title, short_description, content, tags")
    .eq("is_active", true)
    .or(words.map((w) => `title.ilike.%${w}%,short_description.ilike.%${w}%,content.ilike.%${w}%`).join(","))
    .limit(4);

  return data || [];
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
    "Help agents find the right preset response, rewrite replies to be clear and professional, explain calculator results, and answer general support questions.",
    "Keep replies concise and ready to paste into a live chat unless asked for more detail.",
    "When one of the presets below fits the situation, prefer it (adapted to the agent's specifics) over writing something from scratch — it reflects the team's approved tone.",
    presetBlock ? `Presets that may be relevant to this question:\n\n${presetBlock}` : "",
    presetContext ? `Preset content the agent is directly referencing:\n${presetContext}` : "",
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