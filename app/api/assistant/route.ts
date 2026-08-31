import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Server-side only — the Anthropic API key never reaches the browser.
// Any authenticated agent/admin/super_admin can use the assistant;
// RLS on other tables still governs what preset content it can see.
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The AI assistant isn't configured yet. Set ANTHROPIC_API_KEY on the server." },
      { status: 503 }
    );
  }

  const { messages, presetContext } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const systemPrompt = [
    "You are the CX Portal Assistant for Pathao customer-support agents.",
    "Help agents find the right preset response, rewrite replies to be clear and professional, explain calculator results, and answer general support questions.",
    "Keep replies concise and ready to paste into a live chat unless asked for more detail.",
    presetContext ? `Relevant preset content the agent is referencing:\n${presetContext}` : "",
  ].filter(Boolean).join("\n\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: "The assistant couldn't respond. Try again." , detail}, { status: 502 });
    }

    const data = await res.json();
    const text = (data.content || []).map((b: any) => (b.type === "text" ? b.text : "")).join("\n");
    return NextResponse.json({ reply: text });
  } catch {
    return NextResponse.json({ error: "The assistant couldn't respond. Try again." }, { status: 502 });
  }
}
