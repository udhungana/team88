import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_PEERS } from "@/data/mockUsers";
import { defaultFirstConvo } from "@/lib/firstConvoDefaults";
import { clearPersist, loadPersist, savePersist, clearCredentials, loadCredentials } from "@/lib/storage";
import { scorePeers } from "@/lib/match";
import { scanMessage } from "@/lib/safety";
import type {
  AppLocale,
  ChatMessage,
  CurrentUser,
  FirstConvoPersist,
  Invite,
  SafetyFlag,
  ScheduledReminder,
  Thread,
} from "@/types";

type Tab = "first" | "home" | "reminders" | "connections" | "profile";

function migrateUser(raw: CurrentUser | null): CurrentUser | null {
  if (!raw) return null;
  const appLanguage: AppLocale = raw.appLanguage === "ne" ? "ne" : "en";
  return { ...raw, appLanguage };
}

function mergeFirstConvo(raw?: Partial<FirstConvoPersist>): FirstConvoPersist {
  const d = defaultFirstConvo();
  if (!raw) return d;
  return {
    ...d,
    ...raw,
    starters: Array.isArray(raw.starters) ? raw.starters : d.starters,
  };
}

type AppCtx = {
  tab: Tab;
  setTab: (t: Tab) => void;
  currentUser: CurrentUser | null;
  setCurrentUser: (u: CurrentUser | null) => void;
  completeOnboarding: (u: CurrentUser) => void;
  logout: () => void;
  invites: Invite[];
  sendInvite: (peerId: string) => void;
  simulateMutualAccept: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
  threads: Thread[];
  activeThreadId: string | null;
  openThread: (threadId: string) => void;
  closeThread: () => void;
  sendChatMessage: (threadId: string, text: string, flags?: SafetyFlag[]) => void;
  sendPeerChatMessage: (threadId: string, text: string) => void;
  scoredPeers: ReturnType<typeof scorePeers>;
  refreshMatches: () => void;
  scheduledReminders: ScheduledReminder[];
  addReminder: (r: Omit<ScheduledReminder, "id" | "createdAt">) => void;
  updateMood: (emoji: string, text: string) => void;
  firstConvo: FirstConvoPersist;
  patchFirstConvo: (p: Partial<FirstConvoPersist>) => void;
};

const Ctx = createContext<AppCtx | null>(null);

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createUserFromCredentials(username: string, password: string): CurrentUser {
  return {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    displayMode: "anonymous",
    displayName: username,
    username,
    password,
    tags: ["wellness", "community"],
    feelingText: "Looking to connect",
    ethnicity: "prefer not to say",
    region: "us",
    moodEmoji: "🙂",
    moodText: "",
    lastMoodSubmittedAt: null,
    appLanguage: "en",
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>("home");
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [firstConvo, setFirstConvo] = useState<FirstConvoPersist>(defaultFirstConvo);
  const [, bump] = useState(0);

  useEffect(() => {
    const p = loadPersist();
    const loadedUser = migrateUser(p.currentUser);
    
    if (loadedUser) {
      // User data exists, use it
      setCurrentUserState(loadedUser);
    } else {
      // No user data, check for saved credentials
      const savedCreds = loadCredentials();
      if (savedCreds) {
        // Auto-login with saved credentials
        const autoUser = createUserFromCredentials(savedCreds.username, savedCreds.password);
        setCurrentUserState(migrateUser(autoUser));
      }
    }
    
    setInvites(p.invites);
    setThreads(p.threads);
    setScheduledReminders(p.scheduledReminders);
    setFirstConvo(mergeFirstConvo(p.firstConvo));
  }, []);

  useEffect(() => {
    savePersist({
      currentUser,
      invites,
      threads,
      scheduledReminders,
      firstConvo,
    });
  }, [currentUser, invites, threads, scheduledReminders, firstConvo]);

  const setCurrentUser = useCallback((u: CurrentUser | null) => {
    setCurrentUserState(u ? migrateUser(u) : null);
  }, []);

  const completeOnboarding = useCallback((u: CurrentUser) => {
    setCurrentUserState(migrateUser(u));
  }, []);

  const patchFirstConvo = useCallback((p: Partial<FirstConvoPersist>) => {
    setFirstConvo((prev) => ({ ...prev, ...p }));
  }, []);

  const logout = useCallback(() => {
    clearPersist();
    clearCredentials();
    setCurrentUserState(null);
    setInvites([]);
    setThreads([]);
    setScheduledReminders([]);
    setActiveThreadId(null);
    setFirstConvo(defaultFirstConvo());
    setTab("home");
  }, []);

  const scoredPeers = useMemo(() => {
    const tags = currentUser?.tags ?? [];
    return scorePeers(tags, MOCK_PEERS);
  }, [currentUser?.tags, bump]);

  const refreshMatches = useCallback(() => {
    bump((n) => n + 1);
  }, []);

  const sendInvite = useCallback(
    (peerId: string) => {
      if (!currentUser) return;
      setInvites((prev) => {
        if (prev.some((i) => i.peerId === peerId && (i.status === "pending" || i.status === "accepted")))
          return prev;
        if (threads.some((t) => t.peerId === peerId)) return prev;
        return [
          ...prev,
          { id: newId(), peerId, status: "pending", createdAt: new Date().toISOString() },
        ];
      });
    },
    [currentUser, threads]
  );

  const simulateMutualAccept = useCallback((inviteId: string) => {
    setInvites((prev) => {
      const next = prev.map((i) =>
        i.id === inviteId ? { ...i, status: "accepted" as const } : i
      );
      const inv = next.find((i) => i.id === inviteId);
      if (inv?.status === "accepted") {
        setThreads((tprev) => {
          if (tprev.some((t) => t.peerId === inv.peerId)) return tprev;
          return [
            ...tprev,
            { id: newId(), peerId: inv.peerId, messages: [] },
          ];
        });
      }
      return next;
    });
  }, []);

  const declineInvite = useCallback((inviteId: string) => {
    setInvites((prev) =>
      prev.map((i) => (i.id === inviteId ? { ...i, status: "declined" as const } : i))
    );
  }, []);

  const openThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
  }, []);

  const closeThread = useCallback(() => setActiveThreadId(null), []);

  const sendChatMessage = useCallback((threadId: string, text: string, flags?: SafetyFlag[]) => {
    const resolved =
      flags !== undefined
        ? flags
        : scanMessage(text).map((f) => ({ ...f, source: "rule" as const }));
    const msg: ChatMessage = {
      id: newId(),
      threadId,
      fromSelf: true,
      text,
      sentAt: new Date().toISOString(),
      safetyFlags: resolved.length ? resolved : undefined,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, msg] } : t
      )
    );
  }, []);

  const sendPeerChatMessage = useCallback((threadId: string, text: string) => {
    const msg: ChatMessage = {
      id: newId(),
      threadId,
      fromSelf: false,
      text,
      sentAt: new Date().toISOString(),
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, msg] } : t
      )
    );
  }, []);

  const addReminder = useCallback((r: Omit<ScheduledReminder, "id" | "createdAt">) => {
    setScheduledReminders((prev) => [
      ...prev,
      { ...r, id: newId(), createdAt: new Date().toISOString() },
    ]);
  }, []);

  const updateMood = useCallback((emoji: string, text: string) => {
    setCurrentUserState((u) =>
      u
        ? {
            ...u,
            moodEmoji: emoji,
            moodText: text,
            lastMoodSubmittedAt: new Date().toISOString(),
          }
        : u
    );
    bump((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      currentUser,
      setCurrentUser,
      completeOnboarding,
      logout,
      invites,
      sendInvite,
      simulateMutualAccept,
      declineInvite,
      threads,
      activeThreadId,
      openThread,
      closeThread,
      sendChatMessage,
      sendPeerChatMessage,
      scoredPeers,
      refreshMatches,
      scheduledReminders,
      addReminder,
      updateMood,
      firstConvo,
      patchFirstConvo,
    }),
    [
      tab,
      currentUser,
      setCurrentUser,
      completeOnboarding,
      logout,
      invites,
      sendInvite,
      simulateMutualAccept,
      declineInvite,
      threads,
      activeThreadId,
      openThread,
      closeThread,
      sendChatMessage,
      sendPeerChatMessage,
      scoredPeers,
      refreshMatches,
      scheduledReminders,
      addReminder,
      updateMood,
      firstConvo,
      patchFirstConvo,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}
