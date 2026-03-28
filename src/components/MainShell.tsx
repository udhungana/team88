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

export function MainShell() {
  const { t } = useT();
  const { tab, currentUser } = useApp();
  const [distress, setDistress] = useState(false);

  useEffect(() => {
    const ne = currentUser?.appLanguage === "ne";
    document.documentElement.lang = ne ? "ne" : "en";
    document.documentElement.classList.toggle("lang-ne", ne);
  }, [currentUser?.appLanguage]);

  return (
    <div className="min-h-dvh">
      {tab === "home" && <HomeDashboard />}
      {tab === "first" && <FirstConversation />}
      {tab === "reminders" && <RemindersPanel />}
      {tab === "connections" && <ConnectionsPanel />}
      {tab === "profile" && <ProfilePanel />}

      <BottomNav />

      <button
        type="button"
        onClick={() => setDistress(true)}
        className="fixed right-4 z-50 flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-red-700"
        style={{ bottom: "max(7rem, calc(7rem + env(safe-area-inset-bottom)))" }}
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
