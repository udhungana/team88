import { getRegion } from "@/lib/distress";
import type { ConversationStarter, FirstConversationInputs, SafetyFlag } from "@/types";

/**
 * Optional AI Chat Completions for demos.
 * Preferred provider: Perplexity via VITE_PERPLEXITY_API_KEY.
 * Fallback provider: OpenAI via VITE_OPENAI_API_KEY.
 * Keys bundled to the browser are only OK for local demos; production apps should call AI from a backend.
 */
const PERPLEXITY_KEY = (import.meta.env.VITE_PERPLEXITY_API_KEY || "").trim();
const OPENAI_KEY = (import.meta.env.VITE_OPENAI_API_KEY || "").trim();

const AI_PROVIDER = PERPLEXITY_KEY ? "perplexity" : OPENAI_KEY ? "openai" : null;

const BASE = (
  AI_PROVIDER === "perplexity"
    ? import.meta.env.VITE_PERPLEXITY_BASE_URL || "https://api.perplexity.ai"
    : import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1"
).replace(/\/$/, "");

const KEY = AI_PROVIDER === "perplexity" ? PERPLEXITY_KEY : OPENAI_KEY;

const MODEL =
  AI_PROVIDER === "perplexity"
    ? import.meta.env.VITE_PERPLEXITY_MODEL || "sonar"
    : import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

const PERPLEXITY_CHAT_MODEL = import.meta.env.VITE_PERPLEXITY_MODEL_CHAT || "sonar-pro";
const PERPLEXITY_STRUCTURED_MODEL =
  import.meta.env.VITE_PERPLEXITY_MODEL_STRUCTURED || "sonar-reasoning-pro";

export function isOpenAiConfigured(): boolean {
  return !!AI_PROVIDER && KEY.length > 0;
}

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

async function chatCompletion(messages: ChatMsg[], jsonObject: boolean): Promise<string> {
  const modelForRequest =
    AI_PROVIDER === "perplexity"
      ? jsonObject
        ? PERPLEXITY_STRUCTURED_MODEL
        : PERPLEXITY_CHAT_MODEL
      : MODEL;

  const body: Record<string, unknown> = {
    model: modelForRequest,
    messages,
    temperature: jsonObject ? 0.2 : 0.5,
  };
  // OpenAI supports enforced JSON response format.
  // Perplexity is OpenAI-compatible but this field is not guaranteed across models.
  if (jsonObject && AI_PROVIDER !== "perplexity") {
    body.response_format = { type: "json_object" };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${KEY}`,
  };

  let res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  // Model-resilience fallback for Perplexity misconfigured/unsupported model names.
  if (!res.ok && AI_PROVIDER === "perplexity" && res.status === 400) {
    const firstErr = await res.text();
    const retryBody = {
      ...body,
      model: jsonObject ? "sonar-reasoning-pro" : "sonar-pro",
    };
    res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(retryBody),
    });
    if (!res.ok) {
      const secondErr = await res.text();
      throw new Error(secondErr || firstErr || `AI HTTP ${res.status}`);
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `AI HTTP ${res.status}`);
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

function sanitizePeerReply(raw: string): string {
  // Strip markdown bullets/numbering and citation markers to keep replies conversational.
  const cleaned = raw
    .replace(/^\s*(?:\d+[\).:\-]|[-*•])\s+/gm, "")
    .replace(/(?:\[(?:\d+(?:\s*[-,]\s*\d+)*)\])+?/g, "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();

  return cleaned || raw.trim();
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
- Be warm, concise, and conversational.
- First acknowledge the user's feelings, then ask ONE clear follow-up question about how to help next.
- If the user may be in immediate danger or might act on self-harm, tell them clearly to contact local emergency services now.
- Offer light grounding or next-step ideas when appropriate (not therapy).
- Mention 1-2 relevant supports/helplines naturally in text when needed.
- Prefer internet-informed, currently relevant supports when possible. If uncertain, use provided regional helplines.
- End with a gentle reminder to consider licensed professional support if struggles continue.
- Do not include numbered citations like [1] or [2].

User-selected region: ${region.label}

Regional helplines (fallback-safe):
${helplines}

Reference links:
${links}

Output plain text only (no JSON), 2-5 short sentences.`,
  };

  const openaiMessages: ChatMsg[] = [
    system,
    ...params.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const raw = await chatCompletion(openaiMessages, false);
  return sanitizePeerReply(raw);
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

export async function fetchPeerChatReply(params: {
  peerUsername: string;
  peerTags: string[];
  conversation: { role: "user" | "assistant"; content: string }[];
  appLanguage?: string;
}): Promise<string> {
  const lang = (params.appLanguage || "English").trim();
  const tags = params.peerTags.join(", ");

  const system: ChatMsg = {
    role: "system",
    content: `You are roleplaying as a peer named @${params.peerUsername} in a wellness-focused chat app.

Rules:
- Reply as the peer (first-person), warm and natural.
- Keep replies concise (1-3 short sentences).
- Be supportive, curious, and respectful.
- Do not provide medical, legal, or crisis directives.
- Do not claim to be an AI.
- Avoid asking for personal identifying information.
- Do not use numbering, bullets, labels, or markdown formatting.
- Do not include citations, references, or bracketed markers like [1] or [2][5].
- Output plain conversational text only.
- Preferred language: ${lang}.

Peer profile tags: ${tags || "none"}`,
  };

  const msgs: ChatMsg[] = [
    system,
    ...params.conversation.map((m) => ({ role: m.role, content: m.content })),
  ];

  const raw = await chatCompletion(msgs, false);
  return sanitizePeerReply(raw);
}

type StartersJson = {
  starters?: Array<{
    text?: string;
    whyItWorks?: string;
  }>;
};

export async function fetchFirstConversationStarters(
  input: FirstConversationInputs
): Promise<ConversationStarter[]> {
  const system: ChatMsg = {
    role: "system",
    content: `You generate emotionally safe, practical conversation starters for a mental-wellness peer app.

Rules:
- Return JSON only in this shape: {"starters":[{"text":"...","whyItWorks":"..."}]}
- Generate exactly 7 starters.
- Keep each "text" concise (1-2 sentences).
- Keep each "whyItWorks" concise (1 sentence).
- Be respectful, non-clinical, and non-diagnostic.
- Use "I" statements and gentle tone.
- Avoid absolute guarantees, manipulation, blame, or shame.
- Match user's target language where possible.
- If user language is Nepali, write naturally in Nepali.
- No markdown, no extra keys, no prose outside JSON.`,
  };

  const user: ChatMsg = {
    role: "user",
    content: JSON.stringify(
      {
        feeling: input.feeling,
        audience: input.audience,
        topics: input.topics,
        language: input.language,
        cultureRegion: input.cultureRegion,
        timePreference: input.timePreference,
      },
      null,
      2
    ),
  };

  const raw = await chatCompletion([system, user], true);
  const parsed = parseJsonObject<StartersJson>(raw);
  const list = Array.isArray(parsed.starters) ? parsed.starters : [];

  const normalized = list
    .map((s, idx) => ({
      id: `ai-${idx + 1}`,
      text: (s.text || "").trim(),
      whyItWorks: (s.whyItWorks || "").trim(),
    }))
    .filter((s) => s.text.length > 0 && s.whyItWorks.length > 0)
    .slice(0, 7);

  if (normalized.length < 3) {
    throw new Error("AI returned insufficient starter items");
  }

  // Ensure stable card count in UI.
  const baseLen = normalized.length;
  while (normalized.length < 7) {
    const clone = normalized[normalized.length % baseLen];
    normalized.push({
      id: `ai-${normalized.length + 1}`,
      text: clone.text,
      whyItWorks: clone.whyItWorks,
    });
  }

  return normalized;
}
