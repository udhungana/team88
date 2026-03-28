import { useEffect, useState } from "react";
import { distressReply, getRegion, REGIONS } from "@/lib/distress";
import { useT } from "@/i18n/useT";
import { fetchDistressAssistantReply, isOpenAiConfigured } from "@/lib/openai";
import type { DistressMessage } from "@/types";

type Props = { open: boolean; onClose: () => void; defaultRegion: string };

const INTRO_SCRIPTED =
  "I’m here to listen. This is a demo assistant — not a crisis service. If you’re in immediate danger, call your local emergency number.\n\nIn a few words, what’s going on right now?";

const INTRO_AI =
  "I’m an AI support assistant (demo only — not a crisis service). If you’re in immediate danger, call your local emergency number.\n\nWhat’s going on right now? I’ll tailor suggestions to the region you select below.";

export function DistressPanel({ open, onClose, defaultRegion }: Props) {
  const { t } = useT();
  const [region, setRegion] = useState(defaultRegion);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<DistressMessage[]>([]);

  useEffect(() => {
    if (!open) return;
    setRegion(defaultRegion);
    setMessages([
      {
        id: "0",
        role: "assistant",
        text: isOpenAiConfigured() ? INTRO_AI : INTRO_SCRIPTED,
      },
    ]);
    setInput("");
    setLoading(false);
  }, [open, defaultRegion]);

  if (!open) return null;

  const rid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const send = async () => {
    const t = input.trim();
    if (!t || loading) return;
    const userMsg: DistressMessage = { id: rid(), role: "user", text: t };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    if (isOpenAiConfigured()) {
      setLoading(true);
      try {
        const convo = [...messages, userMsg].map((x) => ({
          role: x.role,
          content: x.text,
        })) as { role: "user" | "assistant"; content: string }[];
        const reply = await fetchDistressAssistantReply({
          regionId: region,
          messages: convo.slice(-12),
        });
        setMessages((m) => [...m, { id: rid(), role: "assistant", text: reply }]);
      } catch (e) {
        const fallback = distressReply(t, region);
        const err = e instanceof Error ? e.message : "Unknown error";
        setMessages((m) => [
          ...m,
          {
            id: rid(),
            role: "assistant",
            text: `${fallback}\n\n(AI request failed: ${err.slice(0, 200)} — showing scripted fallback.)`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      const assistantText = distressReply(t, region);
      setMessages((m) => [...m, { id: rid(), role: "assistant", text: assistantText }]);
    }
  };

  const info = getRegion(region);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-mist-100">
      <header className="flex items-center justify-between border-b border-mist-200 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            {t("distress_title")}
          </p>
          <p className="text-sm font-semibold text-ink-950">{t("distress_sub")}</p>
          <p className="text-[10px] text-ink-600">
            {isOpenAiConfigured() ? t("distress_ai_on") : t("distress_ai_off")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-mist-100 px-3 py-2 text-sm font-semibold"
        >
          {t("close_btn")}
        </button>
      </header>

      <div className="border-b border-mist-200 bg-white px-4 py-3">
        <label className="block text-xs font-medium text-ink-700">{t("distress_region")}</label>
        <select
          className="mt-1 w-full rounded-xl border border-mist-200 px-3 py-2 text-sm"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-md space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-8 bg-sea-500 text-white"
                  : "mr-4 bg-white text-ink-900 ring-1 ring-mist-200"
              }`}
            >
              <span className="whitespace-pre-wrap">
                {m.role === "assistant"
                  ? m.text.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={j}>{part.slice(2, -2)}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )
                  : m.text}
              </span>
            </div>
          ))}

          {loading && (
            <div className="mr-4 rounded-2xl bg-white px-4 py-3 text-sm text-ink-600 ring-1 ring-mist-200">
              {t("distress_thinking")}
            </div>
          )}

          <div className="rounded-2xl bg-white p-4 ring-1 ring-mist-200">
            <p className="text-xs font-semibold text-ink-900">
              {t("distress_links")} — {info.label}
            </p>
            <ul className="mt-2 space-y-2">
              {info.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-sea-600 underline"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-ink-700">{t("distress_foot")}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-mist-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-md gap-2">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sea-500/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && void send()}
            placeholder={t("distress_ph")}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading}
            className="min-w-[5.5rem] rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "…" : t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
