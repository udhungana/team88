import type { ReactNode } from "react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/context/AppContext";

export function BottomNav() {
  const { tab, setTab } = useApp();
  const { t } = useT();

  const Item = ({
    id,
    labelKey,
    icon,
  }: {
    id: "first" | "home" | "reminders" | "connections" | "profile";
    labelKey: string;
    icon: ReactNode;
  }) => {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[9px] font-semibold leading-tight transition sm:text-[10px] ${
          active ? "text-sea-600" : "text-ink-700"
        }`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition sm:h-9 sm:w-9 sm:rounded-xl ${
            active ? "bg-sea-500/15 text-sea-600" : "bg-transparent text-ink-700"
          }`}
        >
          {icon}
        </span>
        {t(labelKey)}
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-mist-200 bg-white/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 shadow-nav backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl px-0.5">
        <Item
          id="first"
          labelKey="nav_first"
          icon={
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h10M4 18h7"
              />
            </svg>
          }
        />
        <Item
          id="home"
          labelKey="nav_swipe"
          icon={
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          }
        />
        <Item
          id="reminders"
          labelKey="nav_remind"
          icon={
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          }
        />
        <Item
          id="connections"
          labelKey="nav_connect"
          icon={
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />
        <Item
          id="profile"
          labelKey="nav_profile"
          icon={
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />
      </div>
    </nav>
  );
}
