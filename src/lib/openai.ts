import { getRegion } from "@/lib/distress";
import type { SafetyFlag } from "@/types";

/**
 * Optional OpenAI Chat Completions for demos.
 * Set VITE_OPENAI_API_KEY in `.env.local`. Keys bundled to the browser are only OK for local demos;
 * production apps should call OpenAI from your backend.
 */
const BASE = (import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
  /\/$/,
  ""
);
const KEY = (import.meta.env.VITE_OPENAI_API_KEY || "").trim();
const MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

export function isOpenAiConfigured(): boolean {
  return KEY.length > 0;
}

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

async function chatCompletion(messages: ChatMsg[], jsonObject: boolean): Promise<string> {
  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature: jsonObject ? 0.2 : 0.5,
  };
  if (jsonObject) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `OpenAI HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Empty model response");
  }
  return content.trim();
}

function parseJsonObject<T>(raw: string): T {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const jsonStr = fence ? fence[1]!.trim() : trimmed;
  return JSON.parse(jsonStr) as T;
}

export async function fetchDistressAssistantReply(params: {
  regionId: string;
  messages: { role: "user" | "assistant"; content: string }[];
}): Promise<string> {
  const region = getRegion(params.regionId);
  const helplines = region.helplines
    .map((h) => `${h.name}: ${h.number}${h.note ? ` (${h.note})` : ""}`)
    .join("\n");
  const links = region.links.map((l) => `${l.label}: ${l.url}`).join("\n");

  const system: ChatMsg = {
    role: "system",
    content: `You are a supportive, non-clinical wellness assistant inside a DEMO web app. You do not diagnose, treat, or replace emergency or professional care.

Rules:
- Be warm, concise (roughly 2–5 short paragraphs). Use plain language.
- If the user may be in immediate danger or might act on self-harm, tell them clearly to contact local emergency services now. Then list the helplines below for their region.
- Offer light grounding or next-step ideas when appropriate (not therapy).
- Mention relevant helplines from the list when crisis, severe distress, or self-harm comes up.
- End with a gentle reminder to consider licensed professional support if struggles continue.

User-selected region: ${region.label}

Helplines (use when relevant):
${helplines}

Reference links (you may mention by name; user also sees clickable links in the app UI):
${links}

Do not claim you are a human crisis counselor. This is an AI demo.`,
  };

  const openaiMessages: ChatMsg[] = [
    system,
    ...params.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  return chatCompletion(openaiMessages, false);
}

type SafetyJson = {
  severity?: string;
  categories?: string[];
  userBrief?: string;
};

export async function fetchStrangerChatSafetyFlags(params: {
  outgoingText: string;
  recentContext: string;
}): Promise<SafetyFlag | null> {
  const system: ChatMsg = {
    role: "system",
    content: `You classify OUTGOING user messages in a stranger-to-stranger peer chat app (mental wellness demo).

Flag concerns such as: oversharing PII (address, IDs, passwords, financial details), scams (money, gift cards, crypto, urgent transfers), pushing to leave the platform, harassment, threats, sexual content involving minors, or grooming patterns.

Respond with JSON only, shape:
{"severity":"none"|"low"|"medium"|"high","categories":["short labels"],"userBrief":"One sentence shown to the user, or empty string if severity is none"}

Use severity "none" when the message is generally safe for a first-time stranger chat. Be calibrated: casual friendly chat = none.`,
  };

  const user: ChatMsg = {
    role: "user",
    content: `Recent conversation snippet (may be empty):\n${params.recentContext || "(no prior messages)"}\n\n---\nOutgoing message to analyze:\n${params.outgoingText}`,
  };

  const raw = await chatCompletion([system, user], true);
  let parsed: SafetyJson;
  try {
    parsed = parseJsonObject<SafetyJson>(raw);
  } catch {
    return null;
  }

  const sev = (parsed.severity || "none").toLowerCase();
  if (sev === "none") {
    return null;
  }

  const severity =
    sev === "high" || sev === "medium" || sev === "low" ? sev : null;
  if (!severity) return null;

  const brief =
    parsed.userBrief?.trim() ||
    "This message may warrant a second look before sending to someone you just met.";

  const cats = Array.isArray(parsed.categories) ? parsed.categories.filter(Boolean) : [];
  const catSuffix = cats.length ? ` (${cats.join(", ")})` : "";

  return {
    ruleId: "ai-safety",
    severity,
    message: `AI safety check${catSuffix}: ${brief}`,
    source: "ai",
  };
}

export function mergeSafetyFlags(ruleFlags: SafetyFlag[], aiFlag: SafetyFlag | null): SafetyFlag[] {
  if (!aiFlag) return ruleFlags;
  return [...ruleFlags, aiFlag];
}
