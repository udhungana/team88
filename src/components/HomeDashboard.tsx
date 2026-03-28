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
    updateMood,
    refreshMatches,
  } = useApp();
  const [idx, setIdx] = useState(4);
  const idxRef = useRef(idx);
  idxRef.current = idx;
  const [typedMood, setTypedMood] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [matchUpdating, setMatchUpdating] = useState(false);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(() => new Set());
  const [dragX, setDragX] = useState(0);
  const dragXRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragging = useRef(false);

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
    const mt = currentUser?.moodText?.trim() ?? "";
    if (!mt) return baseList;
    return rankPeersByMood(baseList, mt);
  }, [baseList, currentUser?.moodText]);

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

  const submitMood = () => {
    const text = typedMood.trim();
    const hasTyped = text.length > 0;
    const moodIndex = hasTyped ? inferMoodEmojiIndex(text, idx) : idx;
    const moodEmoji = MOOD_EMOJIS[moodIndex] ?? MOOD_EMOJIS[1]!;

    if (hasTyped) {
      setIdx(moodIndex);
      setMatchUpdating(true);
      setSkippedIds(new Set());
      window.setTimeout(() => {
        updateMood(moodEmoji, text);
        refreshMatches();
        setMatchUpdating(false);
        showToast(t("toast_mood_typed"));
      }, 850);
    } else {
      updateMood(moodEmoji, text);
      refreshMatches();
      setSkippedIds(new Set());
      showToast(t("toast_mood"));
    }
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
    if (!top || matchUpdating) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = true;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragXRef.current = 0;
    setDragX(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !top) return;
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

  useEffect(() => {
    dragXRef.current = 0;
    setDragX(0);
  }, [top?.id]);

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-md px-4 pb-36 pt-6">
      <header className="mb-6">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-coral-500">
          {t("dashboard")}
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-950">
          {t("hi")} {currentUser.displayName}
        </h2>
        <p className="mt-1 text-sm text-ink-700">{t("dash_sub")}</p>
      </header>

      <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-mist-200">
        <p className="text-center text-sm font-semibold text-ink-800">{t("mood")}</p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label={t("mood_prev")}
            onClick={() => setIdx((i) => (i - 1 + MOOD_EMOJIS.length) % MOOD_EMOJIS.length)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist-100 text-ink-800 transition hover:bg-mist-200"
          >
            ‹
          </button>
          <div className="flex flex-col items-center">
            <div className="text-6xl leading-none">{emoji}</div>
            <p className="mt-2 max-w-[14rem] text-center text-xs font-medium leading-snug text-ink-700">
              {moodLabel}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("mood_next")}
            onClick={() => setIdx((i) => (i + 1) % MOOD_EMOJIS.length)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist-100 text-ink-800 transition hover:bg-mist-200"
          >
            ›
          </button>
        </div>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-ink-700">{t("mood_type")}</span>
          <input
            className="mt-1 w-full rounded-2xl border border-mist-200 px-4 py-3 text-sm outline-none ring-sea-500/30 focus:ring-2"
            value={typedMood}
            onChange={(e) => setTypedMood(e.target.value)}
            placeholder={t("mood_type_ph")}
          />
        </label>
        <button
          type="button"
          onClick={submitMood}
          disabled={matchUpdating}
          className="mt-4 w-full rounded-2xl bg-sea-500 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sea-600 disabled:opacity-60"
        >
          {matchUpdating ? t("updating_matches") : t("submit_mood")}
        </button>
        {currentUser.lastMoodSubmittedAt && (
          <p className="mt-2 text-center text-[11px] text-ink-700">{t("last_checkin")}</p>
        )}
      </section>

      <section className="mt-8">
        <h3 className="font-display text-lg font-semibold text-ink-950">{t("people_vibe")}</h3>
        <p className="text-xs text-ink-700">{t("swipe_hint")}</p>

        {matchUpdating && (
          <div className="mt-4 rounded-2xl bg-sea-500/10 px-4 py-3 text-center text-sm font-medium text-sea-800 ring-1 ring-sea-500/20">
            {t("rerank")}
          </div>
        )}

        <div className="relative mx-auto mt-4 min-h-[26rem] max-w-sm pt-10">
          {back && <StackCard peer={back} depth={2} t={t} />}
          {mid && <StackCard peer={mid} depth={1} t={t} />}
          {top ? (
            <div
              role="application"
              aria-label={t("swipe_aria")}
              className="touch-pan-y"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className={`relative z-20 mx-auto max-w-sm select-none ${!isDragging && dragX === 0 ? "transition-transform duration-200 ease-out" : ""}`}
                style={{
                  transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
                }}
              >
                <PeerCardContent peer={top} />
                <div className="pointer-events-none absolute inset-0 flex justify-between px-2 pt-2">
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
              </div>
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink-700 ring-1 ring-mist-200">
              {rankedList.length === 0 ? t("empty_all") : t("empty_passed")}
            </p>
          )}
        </div>

        {top && (
          <div className="mt-4 flex justify-center gap-6 text-[11px] text-ink-600">
            <span>{t("swipe_hint_lr")}</span>
            <span>{t("swipe_hint_rl")}</span>
          </div>
        )}
      </section>

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
      <div className="mx-auto max-w-sm rounded-3xl bg-white p-5 shadow-md ring-1 ring-mist-200">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mist-100 text-3xl">
            {peer.moodEmoji}
          </div>
          <div>
            <p className="font-semibold text-ink-950">@{peer.username}</p>
            <p className="text-xs text-ink-600">{depth === 2 ? t("stack_pos") : t("next_stack")}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {peer.tags.slice(0, 6).map((tag) => {
            const hit = peer.matchedTags.some((m) => m.toLowerCase() === tag.toLowerCase());
            return (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-[10px] ${
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

function PeerCardContent({ peer }: { peer: ScoredPeer }) {
  return (
    <div className="mx-auto max-w-sm cursor-grab active:cursor-grabbing rounded-3xl bg-white p-5 shadow-soft ring-1 ring-mist-200">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mist-100 text-3xl">
          {peer.moodEmoji}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-950">@{peer.username}</p>
          <p className="line-clamp-2 text-xs text-ink-700">{peer.feelingSnippet}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {peer.tags.map((tag) => {
          const hit = peer.matchedTags.some((m) => m.toLowerCase() === tag.toLowerCase());
          return (
            <span
              key={tag}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                hit
                  ? "bg-sage-500/20 text-sage-600 ring-1 ring-sage-500/30"
                  : "bg-mist-100 text-ink-700"
              }`}
            >
              {tag}
            </span>
          );
        })}
      </div>
    </div>
  );
}
