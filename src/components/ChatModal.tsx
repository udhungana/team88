import { useEffect, useMemo, useRef, useState } from "react";
import { MOCK_PEERS } from "@/data/mockUsers";
import { getMoodBasedChatStarters } from "@/lib/chatMoodStarters";
import {
  fetchStrangerChatSafetyFlags,
  isOpenAiConfigured,
  mergeSafetyFlags,
} from "@/lib/openai";
import { SAFETY_DEMO_PHRASES, scanMessage } from "@/lib/safety";
import { useT } from "@/i18n/useT";
import { useApp } from "@/context/AppContext";

export function ChatModal() {
  const { t } = useT();
  const { threads, activeThreadId, closeThread, sendChatMessage, currentUser } = useApp();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [startersOpen, setStartersOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = threads.find((t) => t.id === activeThreadId);
  const peer = thread ? MOCK_PEERS.find((p) => p.id === thread.peerId) : null;

  const starters = useMemo(() => {
    if (!currentUser || !peer) return [];
    return getMoodBasedChatStarters(currentUser, peer, currentUser.appLanguage);
  }, [
    peer?.id,
    currentUser?.id,
    currentUser?.moodText,
    currentUser?.feelingText,
    currentUser?.moodEmoji,
    currentUser?.tags.join("|"),
    currentUser?.appLanguage,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, activeThreadId]);

  useEffect(() => {
    setStartersOpen(true);
  }, [activeThreadId]);

  if (!thread || !peer) return null;

  const send = async () => {
    const t = draft.trim();
    if (!t || sending) return;
    setSending(true);
    setDraft("");

    const ruleFlags = scanMessage(t);
    let merged = ruleFlags;

    if (isOpenAiConfigured()) {
      const recent = thread.messages
        .slice(-6)
        .map((m) => `${m.fromSelf ? "You" : "Them"}: ${m.text}`)
        .join("\n");
      try {
        const aiFlag = await fetchStrangerChatSafetyFlags({
          outgoingText: t,
          recentContext: recent,
        });
        merged = mergeSafetyFlags(ruleFlags, aiFlag);
      } catch {
        merged = ruleFlags;
      }
    }

    sendChatMessage(thread.id, t, merged);
    setSending(false);
  };

  const lastFlag = [...thread.messages].reverse().find((m) => m.safetyFlags?.length);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-mist-100">
      <header className="flex items-center gap-3 border-b border-mist-200 bg-white/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={closeThread}
          className="rounded-xl bg-mist-100 px-3 py-2 text-sm font-semibold text-ink-800"
        >
          {t("chat_back")}
        </button>
        <div>
          <p className="font-semibold text-ink-950">@{peer.username}</p>
          <p className="text-[11px] text-ink-700">
            {t("chat_peer")}
            {isOpenAiConfigured() ? t("chat_ai") : ""}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-md space-y-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-950 ring-1 ring-amber-200">
            {t("chat_safety_short")}
          </div>

          <div className="rounded-2xl bg-white p-3 text-xs text-ink-700 ring-1 ring-mist-200">
            <p className="font-semibold text-ink-900">{t("their_tags")}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {peer.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-mist-100 px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[11px] font-medium text-ink-700">{t("try_demo")}</p>
          <div className="flex flex-wrap gap-2">
            {SAFETY_DEMO_PHRASES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDraft(p)}
                className="rounded-full bg-white px-2 py-1 text-[10px] text-ink-800 ring-1 ring-mist-200"
              >
                {p.slice(0, 28)}…
              </button>
            ))}
          </div>

          {thread.messages.length === 0 && (
            <p className="text-center text-sm text-ink-700">{t("say_hi")}</p>
          )}

          {thread.messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromSelf ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.fromSelf ? "bg-sea-500 text-white" : "bg-white text-ink-900 ring-1 ring-mist-200"
                }`}
              >
                {m.text}
                {m.safetyFlags?.map((f) => (
                  <div
                    key={`${m.id}-${f.ruleId}-${f.source ?? "rule"}`}
                    className={`mt-2 rounded-xl px-2 py-1.5 text-[11px] font-medium leading-snug ${
                      f.severity === "high"
                        ? "bg-red-500/20 text-red-950"
                        : f.severity === "medium"
                          ? "bg-amber-500/25 text-amber-950"
                          : "bg-white/30 text-ink-950"
                    }`}
                  >
                    <span className="flex flex-col gap-1">
                      {f.source === "ai" && (
                        <span className="self-start rounded-md bg-violet-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-950">
                          {t("chat_ai_badge")}
                        </span>
                      )}
                      <span>{f.message}</span>
                    </span>
                    {f.severity === "high" && (
                      <div className="mt-1">
                        <a
                          href="https://www.consumer.ftc.gov/articles/0060-10-tips-avoiding-scams"
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          {t("chat_ftc")}
                        </a>
                        {" · "}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => console.info("[demo] report submitted", m.id)}
                        >
                          {t("chat_report")}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {lastFlag?.safetyFlags?.some((f) => f.severity === "high") && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-center text-[11px] font-medium text-red-900">
          {t("chat_strong_warn")}
        </div>
      )}

      {starters.length > 0 && (
        <div className="border-t border-mist-200 bg-gradient-to-b from-sea-50/80 to-white px-3 pt-3 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
          <div className="mx-auto max-w-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-sea-800">
                  {t("chat_starter_title")}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-ink-600">{t("chat_starter_sub")}</p>
              </div>
              <button
                type="button"
                onClick={() => setStartersOpen((o) => !o)}
                className="shrink-0 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-sea-800 ring-1 ring-sea-200"
              >
                {startersOpen ? t("chat_starter_hide") : t("chat_starter_show")}
              </button>
            </div>
            {startersOpen && (
              <div className="mt-2 space-y-1.5 pb-1">
                {starters.map((line, i) => (
                  <button
                    key={`${i}-${line.slice(0, 24)}`}
                    type="button"
                    onClick={() => setDraft(line)}
                    className="w-full rounded-2xl bg-white px-3 py-2.5 text-left text-xs leading-snug text-ink-900 ring-1 ring-mist-200 transition hover:bg-mist-50"
                  >
                    <span className="text-[10px] font-semibold text-sea-600">{t("chat_starter_use")}</span>
                    <span className="mt-0.5 block font-normal text-ink-800">{line}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-mist-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-md gap-2">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !sending && void send()}
            placeholder={t("chat_placeholder")}
            disabled={sending}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending}
            className="min-w-[4.5rem] rounded-2xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sending ? "…" : t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
