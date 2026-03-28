import { useEffect, useState } from "react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/context/AppContext";
import { BottomNav } from "@/components/BottomNav";
import { HomeDashboard } from "@/components/HomeDashboard";
import { FirstConversation } from "@/components/FirstConversation";
import { ConnectionsPanel } from "@/components/ConnectionsPanel";
import { RemindersPanel } from "@/components/RemindersPanel";
import { ProfilePanel } from "@/components/ProfilePanel";
import { ChatModal } from "@/components/ChatModal";
import { DistressPanel } from "@/components/DistressPanel";

type TabId = "first" | "home" | "reminders" | "connections" | "profile";

const TAB_META: {
  id: TabId;
  labelKey: string;
  icon: JSX.Element;
}[] = [
  {
    id: "first",
    labelKey: "nav_first",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
      </svg>
    ),
  },
  {
    id: "home",
    labelKey: "nav_swipe",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    ),
  },
  {
    id: "reminders",
    labelKey: "nav_remind",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
  {
    id: "connections",
    labelKey: "nav_connect",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    id: "profile",
    labelKey: "nav_profile",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export function MainShell() {
  const { t } = useT();
  const { tab, setTab, currentUser, logout } = useApp();
  const [distress, setDistress] = useState(false);

  useEffect(() => {
    const ne = currentUser?.appLanguage === "ne";
    document.documentElement.lang = ne ? "ne" : "en";
    document.documentElement.classList.toggle("lang-ne", ne);
  }, [currentUser?.appLanguage]);

  const tabPanel =
    tab === "home" ? (
      <HomeDashboard />
    ) : tab === "first" ? (
      <FirstConversation />
    ) : tab === "reminders" ? (
      <RemindersPanel />
    ) : tab === "connections" ? (
      <ConnectionsPanel />
    ) : (
      <ProfilePanel />
    );

  return (
    <div className="min-h-dvh lg:bg-[radial-gradient(circle_at_8%_0%,rgba(91,140,255,0.16),transparent_45%),radial-gradient(circle_at_98%_90%,rgba(90,184,138,0.16),transparent_38%)]">
      <div className="mx-auto min-h-dvh w-full tablet:px-4 tablet:py-4 lg:flex lg:max-w-[1440px] lg:gap-6 lg:px-6 lg:py-6">
        <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:rounded-panel lg:bg-ink-950 lg:p-5 lg:text-white lg:shadow-panel">
          <div>
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-sea-300/90">
              {t("together")}
            </p>
            <p className="mt-3 font-display text-2xl font-bold">{currentUser?.displayName}</p>
            <p className="mt-1 text-sm text-white/70">@{currentUser?.username}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {TAB_META.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`hover-depth flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-white text-ink-900 shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active ? "bg-sea-500/15 text-sea-600" : "bg-white/10"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {t(item.labelKey)}
                </button>
              );
            })}

                        <button
                          type="button"
                          onClick={logout}
                          className="hover-depth mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/20 px-3 py-3 text-left text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </span>
                          {t("logout")}
                        </button>
            <button
              type="button"
              onClick={() => setDistress(true)}
              className="hover-depth flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 mt-4"
            >
              <span className="text-lg leading-none">!</span>
              {t("help_now")}
            </button>
          </nav>
        </aside>

        <main className="min-h-dvh flex-1 lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden lg:rounded-panel lg:bg-white/72 lg:shadow-panel lg:ring-1 lg:ring-white/80 lg:backdrop-blur">
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:border-b lg:border-mist-200/70 lg:px-7 lg:py-4 lg:shrink-0">
            <p className="font-display text-xl font-semibold text-ink-950">{t("together")}</p>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink-600">Wellness workspace</p>
          </div>
          <div className="section-fade flex-1 lg:overflow-y-auto">{tabPanel}</div>
        </main>
      </div>

      <BottomNav />

      <button
        type="button"
        onClick={() => setDistress(true)}
        className="distress-fab fixed right-4 z-50 flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-red-700 lg:hidden"
      >
        <span className="text-lg leading-none">!</span>
        {t("help_now")}
      </button>

      <DistressPanel
        open={distress}
        onClose={() => setDistress(false)}
        defaultRegion={currentUser?.region ?? "us"}
      />

      <ChatModal />
    </div>
  );
}
