const KEY = "together-mvp-v1";

export type PersistShape = {
  currentUser: import("@/types").CurrentUser | null;
  invites: import("@/types").Invite[];
  threads: import("@/types").Thread[];
  scheduledReminders: import("@/types").ScheduledReminder[];
  firstConvo?: import("@/types").FirstConvoPersist;
};

const defaultShape: PersistShape = {
  currentUser: null,
  invites: [],
  threads: [],
  scheduledReminders: [],
};

export function loadPersist(): PersistShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultShape };
    const parsed = JSON.parse(raw) as Partial<PersistShape>;
    return {
      currentUser: parsed.currentUser ?? null,
      invites: Array.isArray(parsed.invites) ? parsed.invites : [],
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      scheduledReminders: Array.isArray(parsed.scheduledReminders) ? parsed.scheduledReminders : [],
      firstConvo: parsed.firstConvo,
    };
  } catch {
    return { ...defaultShape };
  }
}

export function savePersist(data: PersistShape) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearPersist() {
  localStorage.removeItem(KEY);
}
