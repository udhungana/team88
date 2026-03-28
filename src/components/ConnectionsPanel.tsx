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
  const [profilePeerId, setProfilePeerId] = useState<string | null>(null);

  const pending = invites.filter((i) => i.status === "pending");
  const peer = profilePeerId ? MOCK_PEERS.find((p) => p.id === profilePeerId) : null;

  return (
    <div className="mx-auto max-w-md px-4 pb-36 pt-6 tablet:max-w-4xl tablet:px-6 tablet:pb-24 tablet:pt-8 lg:max-w-6xl lg:px-8 lg:pb-14 lg:pt-10">
      <header className="mb-6">
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-coral-500">
          {t("connections")}
        </p>
        <h2 className="font-display text-2xl font-bold text-ink-950">{t("invites_chats")}</h2>
        <p className="mt-1 text-sm text-ink-700">{t("conn_sub")}</p>
      </header>

      <div className="tablet:grid tablet:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] tablet:gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-6">
        <section className="section-fade tablet:rounded-3xl tablet:bg-white tablet:p-4 tablet:shadow-soft tablet:ring-1 tablet:ring-mist-200 lg:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-900">{t("pending_sent")}</h3>
            <span className="rounded-full bg-mist-100 px-2.5 py-1 text-[11px] font-semibold text-ink-700">
              {pending.length}
            </span>
          </div>
          {pending.length > 0 ? (
            <ul className="stagger-list mt-3 flex flex-col gap-3">
            {pending.map((inv) => {
              const p = MOCK_PEERS.find((x) => x.id === inv.peerId);
              if (!p) return null;
              return (
                <li
                  key={inv.id}
                  className="token-card hover-depth rounded-2xl bg-white p-4 ring-1 ring-mist-200"
                >
                  <p className="font-medium text-ink-950">@{p.username}</p>
                  <p className="text-xs text-ink-700">{t("waiting")}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => simulateMutualAccept(inv.id)}
                      className="flex-1 rounded-xl bg-sea-500 py-2.5 text-xs font-semibold text-white"
                    >
                      {t("sim_accept")}
                    </button>
                    <button
                      type="button"
                      onClick={() => declineInvite(inv.id)}
                      className="rounded-xl border border-mist-200 px-3 text-xs font-semibold text-ink-800"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </li>
              );
            })}
            </ul>
          ) : (
            <p className="mt-3 rounded-2xl bg-white p-5 text-sm text-ink-700 ring-1 ring-mist-200 lg:bg-mist-50">
              {t("no_threads")}
            </p>
          )}
        </section>

        <section className="section-fade mt-8 tablet:mt-0 tablet:rounded-3xl tablet:bg-white tablet:p-4 tablet:shadow-soft tablet:ring-1 tablet:ring-mist-200 lg:p-5">
          <h3 className="text-sm font-semibold text-ink-900">{t("active_chats")}</h3>
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
                <li
                  key={th.id}
                  className="token-card hover-depth flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-mist-200"
                >
                  <button
                    type="button"
                    onClick={() => setProfilePeerId(p.id)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mist-100 text-2xl"
                  >
                    {p.moodEmoji}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-950">@{p.username}</p>
                    <p className="truncate text-xs text-ink-700">
                      {th.messages.length
                        ? th.messages[th.messages.length - 1]!.text
                        : t("no_msgs")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openThread(th.id)}
                    className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-semibold text-white"
                  >
                    {t("open")}
                  </button>
                </li>
              );
            })}
            </ul>
          )}
        </section>
      </div>

      {peer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <p className="font-display text-lg font-bold text-ink-950">@{peer.username}</p>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-ink-700">{t("conn_peer_tags")}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {peer.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-mist-100 px-2 py-0.5 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-ink-700">{t("conn_peer_note")}</p>
            </div>
            <button
              type="button"
              onClick={() => setProfilePeerId(null)}
              className="mt-6 w-full rounded-2xl bg-ink-900 py-3 text-sm font-semibold text-white"
            >
              {t("close_btn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
