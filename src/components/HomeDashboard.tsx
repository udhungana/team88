import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { inferMoodEmojiIndex } from "@/lib/inferMoodEmoji";
import { rankPeersByMood } from "@/lib/match";
import { useApp } from "@/context/AppContext";
import { useT } from "@/i18n/useT";
import type { ScoredPeer } from "@/lib/match";

const MOOD_EMOJIS = [
  "😀",
  "🙂",
  "😐",
  "😔",
  "😣",
  "😢",
  "😤",
  "🌿",
  "💙",
  "🌙",
  "✨",
  "🧘",
] as const;

const MOOD_LABEL_KEYS = [
  "mood_joyful",
  "mood_good",
  "mood_neutral",
  "mood_down",
  "mood_stress",
  "mood_sad",
  "mood_frust",
  "mood_calm",
  "mood_support",
  "mood_night",
  "mood_hope",
  "mood_mindful",
] as const;

const SWIPE_THRESHOLD = 96;

export function HomeDashboard() {
  const { t } = useT();
  const {
    currentUser,
    scoredPeers,
    sendInvite,
    invites,
    threads,
  } = useApp();
  const [idx, setIdx] = useState(4);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const [typedMood, setTypedMood] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(() => new Set());
  const [dragX, setDragX] = useState(0);
  const dragXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragging = useRef(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [moodSelected, setMoodSelected] = useState(false);


  const emoji = MOOD_EMOJIS[idx] ?? MOOD_EMOJIS[1]!;
  const moodLabel = t(MOOD_LABEL_KEYS[idx] ?? "mood_good");

  useEffect(() => {
    const text = typedMood.trim();
    if (text.length < 2) return;
    const handle = window.setTimeout(() => {
      const next = inferMoodEmojiIndex(text, idxRef.current);
      setIdx(next);
    }, 320);
    return () => window.clearTimeout(handle);
  }, [typedMood]);

  const blockedPeerIds = useMemo(() => {
    const s = new Set<string>();
    threads.forEach((x) => s.add(x.peerId));
    invites.forEach((i) => {
      if (i.status === "pending" || i.status === "accepted") s.add(i.peerId);
    });
    return s;
  }, [threads, invites]);

  const baseList = useMemo(
    () => scoredPeers.filter((p) => !blockedPeerIds.has(p.id)),
    [scoredPeers, blockedPeerIds]
  );

  const rankedList = useMemo(() => {
    const signal = typedMood.trim() || moodLabel;
    if (!signal.trim()) return baseList;
    return rankPeersByMood(baseList, signal);
  }, [baseList, typedMood, moodLabel]);

  const queue = useMemo(
    () => rankedList.filter((p) => !skippedIds.has(p.id)),
    [rankedList, skippedIds]
  );

  const top = queue[0] ?? null;
  const mid = queue[1] ?? null;
  const back = queue[2] ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const invite = useCallback(
    (peerId: string, name: string) => {
      sendInvite(peerId);
      showToast(`${t("toast_invite")} @${name}`);
    },
    [sendInvite, t]
  );

  const passPeer = useCallback(
    (peerId: string) => {
      setSkippedIds((prev) => new Set(prev).add(peerId));
      setDragX(0);
      showToast(t("toast_pass"));
    },
    [t]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (!top || window.innerWidth >= 1024) return; // Disable swipe on desktop
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = true;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragXRef.current = 0;
    setDragX(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !top || window.innerWidth >= 1024) return; // Disable swipe on desktop
    const x = e.clientX - dragStartX.current;
    dragXRef.current = x;
    setDragX(x);
  };

  const endDrag = () => {
    const x = dragXRef.current;
    if (!top) {
      dragging.current = false;
      setIsDragging(false);
      dragXRef.current = 0;
      setDragX(0);
      return;
    }
    if (x > SWIPE_THRESHOLD) {
      invite(top.id, top.username);
      dragXRef.current = 0;
      setDragX(0);
    } else if (x < -SWIPE_THRESHOLD) {
      passPeer(top.id);
    } else {
      dragXRef.current = 0;
      setDragX(0);
    }
    dragging.current = false;
    setIsDragging(false);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    endDrag();
  };

  const changeMoodPrev = () => {
    setIdx((i) => (i - 1 + MOOD_EMOJIS.length) % MOOD_EMOJIS.length);
    setTypedMood("");
  };

  const changeMoodNext = () => {
    setIdx((i) => (i + 1) % MOOD_EMOJIS.length);
    setTypedMood("");
  };

  const revealPeople = () => {
    setMoodSelected(true);
  };

  const onCardClick = () => {
    if (top) {
      setSelectedCardId(selectedCardId === top.id ? null : top.id);
    }
  };

  const handleConnect = () => {
    if (top) {
      invite(top.id, top.username);
      setSelectedCardId(null);
    }
  };

  const handlePass = () => {
    if (top) {
      passPeer(top.id);
      setSelectedCardId(null);
    }
  };

  useEffect(() => {
    dragXRef.current = 0;
    setDragX(0);
    setSelectedCardId(null);
  }, [top?.id]);

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-md px-4 pb-36 pt-6 tablet:max-w-3xl tablet:px-6 tablet:pb-24 tablet:pt-8 lg:max-w-6xl lg:px-8 lg:pb-14 lg:pt-10">
      <header className="mb-6 lg:mb-8">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-coral-500">
          {t("dashboard")}
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-950">
          {t("hi")} {currentUser.displayName}
        </h2>
        <p className="mt-1 text-sm text-ink-700">{t("dash_sub")}</p>
      </header>

      <div className="tablet:grid tablet:grid-cols-1 tablet:gap-5 tablet:items-start lg:gap-7">
        {!moodSelected ? (
        <section className="token-panel section-fade rounded-3xl bg-white p-5 ring-1 ring-mist-200 lg:p-6">
          <p className="text-center text-sm font-semibold text-ink-800">{t("mood")}</p>
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={changeMoodPrev}
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-mist-200 transition text-ink-600"
              aria-label="Previous mood"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col items-center px-4">
              <div
                role="img"
                aria-label={moodLabel}
                className="select-none rounded-3xl bg-mist-100 px-8 py-5 text-6xl leading-none ring-1 ring-mist-200"
              >
                {emoji}
              </div>
              <p className="mt-2 max-w-[14rem] text-center text-xs font-medium leading-snug text-ink-700">
                {moodLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={changeMoodNext}
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-mist-200 transition text-ink-600"
              aria-label="Next mood"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-ink-700">{t("mood_type")}</span>
            <input
              className="mt-1 w-full rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
              value={typedMood}
              onChange={(e) => {
                setTypedMood(e.target.value);
              }}
              placeholder={t("mood_type_ph")}
            />
          </label>

          <button
            type="button"
            onClick={revealPeople}
            className="mt-4 w-full rounded-2xl bg-sea-500 py-3 text-sm font-semibold text-white transition hover:bg-sea-600"
          >
            Go
          </button>

          <div className="mt-8 border-t border-mist-200 pt-6">
            <p className="rounded-2xl bg-mist-100 px-4 py-3 text-center text-sm text-ink-700 ring-1 ring-mist-200">
              Select your mood and tap Go to see people you may connect with.
            </p>
          </div>

          {currentUser.lastMoodSubmittedAt && (
            <p className="mt-4 text-center text-[11px] text-ink-700">{t("last_checkin")}</p>
          )}
        </section>
        ) : (
        <section className="token-panel section-fade rounded-3xl bg-white p-5 ring-1 ring-mist-200 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                role="img"
                aria-label={moodLabel}
                className="select-none rounded-2xl bg-mist-100 px-4 py-3 text-3xl leading-none ring-1 ring-mist-200"
              >
                {emoji}
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-700 uppercase">{t("mood")}</p>
                <p className="text-sm font-semibold text-ink-900">{moodLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMoodSelected(false);
                setTypedMood("");
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-ink-600 hover:bg-mist-100 transition"
              aria-label="Change mood"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Change
            </button>
          </div>
          <h3 className="text-center font-display text-lg font-semibold text-ink-950">
            {t("people_vibe")}
          </h3>
          <p className="text-center text-xs text-ink-700 mt-2 lg:hidden">{t("swipe_hint")}</p>
          <p className="hidden lg:block text-center text-xs text-ink-700 mt-2">Click a card to connect or pass</p>

                <div className="relative mx-auto mt-4 min-h-[30rem] max-w-md pt-8 lg:max-w-2xl lg:min-h-[38rem] lg:pt-10">
                  {back && <StackCard peer={back} depth={2} t={t} />}
                  {mid && <StackCard peer={mid} depth={1} t={t} />}
                  {top ? (
                <div
                  role="application"
                  aria-label={t("swipe_aria")}
                  className="touch-pan-y lg:cursor-pointer relative"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onClick={onCardClick}
                >
                  {!isDragging && (
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 justify-between px-1 lg:hidden">
                      <span className="animate-pulse rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                        Swipe • {t("pass")}
                      </span>
                      <span className="animate-pulse rounded-full bg-sea-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
                        Swipe • {t("connect")}
                      </span>
                    </div>
                  )}

                  <div
                    className={`relative z-20 mx-auto max-w-md select-none ${!isDragging && dragX === 0 ? "transition-transform duration-200 ease-out" : ""}`}
                    style={{
                      transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
                    }}
                  >
                    <PeerCardContent peer={top} />
                    {/* Mobile: Show labels on swipe */}
                    <div className="pointer-events-none absolute inset-0 flex justify-between px-2 pt-2 lg:hidden">
                      <span
                        className={`rounded-lg bg-red-500/90 px-2 py-1 text-[10px] font-bold uppercase text-white transition-opacity ${dragX < -40 ? "opacity-100" : "opacity-0"}`}
                      >
                        {t("pass")}
                      </span>
                      <span
                        className={`rounded-lg bg-sea-500/90 px-2 py-1 text-[10px] font-bold uppercase text-white transition-opacity ${dragX > 40 ? "opacity-100" : "opacity-0"}`}
                      >
                        {t("connect")}
                      </span>
                    </div>
                    {/* Desktop: Show buttons on click */}
                    {selectedCardId === top.id && (
                      <div className="pointer-events-auto hidden lg:flex absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full items-center justify-center gap-3 mt-4 z-30">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePass();
                          }}
                          className="flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-xs font-bold uppercase text-white transition hover:bg-red-600 shadow-lg"
                        >
                          <span>✕</span>
                          {t("pass")}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnect();
                          }}
                          className="flex items-center gap-2 rounded-2xl bg-sea-500 px-4 py-2 text-xs font-bold uppercase text-white transition hover:bg-sea-600 shadow-lg"
                        >
                          <span>♥</span>
                          {t("connect")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                  ) : (
                    <p className="token-card rounded-2xl bg-white p-6 text-center text-sm text-ink-700 ring-1 ring-mist-200">
                      {rankedList.length === 0 ? t("empty_all") : t("empty_passed")}
                    </p>
                  )}
                </div>

          {currentUser.lastMoodSubmittedAt && (
            <p className="mt-4 text-center text-[11px] text-ink-700">{t("last_checkin")}</p>
          )}
        </section>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-32 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-ink-900 px-4 py-2 text-center text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function StackCard({
  peer,
  depth,
  t,
}: {
  peer: ScoredPeer;
  depth: 1 | 2;
  t: (k: string) => string;
}) {
  const offset = depth * 14;
  const scale = 1 - depth * 0.05;
  const opacity = 1 - depth * 0.15;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 duration-200"
      style={{
        top: offset,
        transform: `scale(${scale})`,
        zIndex: 15 - depth,
        opacity,
      }}
      aria-hidden
    >
      <div className="token-card hover-depth mx-auto max-w-md rounded-3xl bg-white p-6 ring-1 ring-mist-200">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mist-100 text-4xl">
            {peer.moodEmoji}
          </div>
          <div>
            <p className="font-semibold text-sm text-ink-950">@{peer.username}</p>
            <p className="text-[11px] text-ink-600">{depth === 2 ? t("stack_pos") : t("next_stack")}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {peer.tags.slice(0, 6).map((tag) => {
            const hit = peer.matchedTags.some((m) => m.toLowerCase() === tag.toLowerCase());
            return (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  hit ? "bg-sage-500/20 text-sage-700" : "bg-mist-100 text-ink-600"
                }`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateConsistentMatchPercentage(peerId: string): number {
  // Generate a consistent but random-looking percentage based on peer ID
  let hash = 0;
  for (let i = 0; i < peerId.length; i++) {
    const char = peerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Map hash to percentage between 62-98%
  const percentage = 62 + (Math.abs(hash) % 37);
  return percentage;
}

function PeerCardContent({ peer }: { peer: ScoredPeer }) {
  const matchPercent = generateConsistentMatchPercentage(peer.id);
  return (
    <div className="token-card hover-depth mx-auto max-w-xl cursor-grab active:cursor-grabbing rounded-3xl bg-white p-7 ring-1 ring-mist-200 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-mist-100 text-5xl">
          {peer.moodEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-xl text-ink-950">@{peer.username}</p>
          <p className="mt-1 text-sm font-medium text-sea-600">{matchPercent}% Match</p>
          <p className="line-clamp-3 text-sm text-ink-700 mt-2">{peer.feelingSnippet}</p>
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-mist-100">
        <p className="text-xs font-semibold text-ink-600 mb-3">Interests & Tags</p>
        <div className="flex flex-wrap gap-2">
          {peer.tags.map((tag) => {
            const hit = peer.matchedTags.some((m) => m.toLowerCase() === tag.toLowerCase());
            return (
              <span
                key={tag}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  hit
                    ? "bg-sage-500/15 text-sage-700 ring-1.5 ring-sage-500/40"
                    : "bg-mist-100 text-ink-700"
                }`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
