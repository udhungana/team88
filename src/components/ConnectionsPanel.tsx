import { useState } from "react";
import { MOCK_PEERS } from "@/data/mockUsers";
import { useT } from "@/i18n/useT";
import { useApp } from "@/context/AppContext";

export function ConnectionsPanel() {
  const { t } = useT();
  const {
    invites,
    threads,
    simulateMutualAccept,
    declineInvite,
    openThread,
  } = useApp();
  const [showInviteTray, setShowInviteTray] = useState(false);

  const pending = invites.filter((i) => i.status === "pending");

  return (
    <div className="mx-auto max-w-md px-4 pb-36 pt-6 tablet:max-w-4xl tablet:px-6 tablet:pb-24 tablet:pt-8 lg:max-w-6xl lg:px-8 lg:pb-14 lg:pt-10">
      <header className="mb-6">
        <div>
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-coral-500">
          {t("connections")}
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-950">{t("active_chats")}</h2>
        <p className="mt-1 text-sm text-ink-700">{t("conn_sub")}</p>
        </div>
      </header>

      <section className="section-fade rounded-3xl bg-white p-4 shadow-soft ring-1 ring-mist-200 lg:p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">{t("active_chats")}</h3>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowInviteTray((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-ink-800 ring-1 ring-mist-200 shadow-soft"
              aria-label={t("notifications")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.42V11a6 6 0 10-12 0v3.18a2 2 0 01-.59 1.41L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                />
              </svg>
              {pending.length > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-[1.15rem] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white shadow-sm">
                  {pending.length > 9 ? "9+" : pending.length}
                </span>
              ) : null}
            </button>

            {showInviteTray ? (
              <div className="absolute right-0 top-12 z-20 w-[21rem] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-3 ring-1 ring-mist-200 shadow-xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">{t("pending_sent")}</p>
                  <span className="rounded-full bg-mist-100 px-2 py-0.5 text-[11px] font-semibold text-ink-700">
                    {pending.length}
                  </span>
                </div>
                {pending.length === 0 ? (
                  <p className="rounded-xl bg-mist-50 px-3 py-4 text-xs text-ink-700">{t("no_invites")}</p>
                ) : (
                  <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {pending.map((inv) => {
                      const p = MOCK_PEERS.find((x) => x.id === inv.peerId);
                      if (!p) return null;
                      return (
                        <li key={inv.id} className="rounded-xl bg-mist-50 p-3 ring-1 ring-mist-200">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xl ring-1 ring-mist-200">
                              {p.moodEmoji}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-ink-950">@{p.username}</p>
                              <p className="text-[11px] text-ink-700">{t("waiting")}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => simulateMutualAccept(inv.id)}
                              className="flex-1 rounded-lg bg-sea-500 py-2 text-[11px] font-semibold text-white"
                            >
                              {t("sim_accept")}
                            </button>
                            <button
                              type="button"
                              onClick={() => declineInvite(inv.id)}
                              className="rounded-lg border border-mist-300 px-3 py-2 text-[11px] font-semibold text-ink-800"
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        </div>
          {threads.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-6 text-sm text-ink-700 ring-1 ring-mist-200 lg:bg-mist-50">
              {t("no_threads")}
            </p>
          ) : (
            <ul className="stagger-list mt-3 flex flex-col gap-3">
            {threads.map((th) => {
              const p = MOCK_PEERS.find((x) => x.id === th.peerId);
              if (!p) return null;
              return (
                <li key={th.id}>
                  <button
                    type="button"
                    onClick={() => openThread(th.id)}
                    className="token-card hover-depth flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-mist-200"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist-100 text-2xl">
                      {p.moodEmoji}
                    </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-950">@{p.username}</p>
                    <p className="truncate text-xs text-ink-700">
                      {th.messages.length
                        ? th.messages[th.messages.length - 1]!.text
                        : t("no_msgs")}
                    </p>
                  </div>
                  </button>
                </li>
              );
            })}
            </ul>
          )}
      </section>
    </div>
  );
}
