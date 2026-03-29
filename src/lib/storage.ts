const KEY = "vibespace-v1";
const CREDENTIALS_KEY = "vibespace-credentials-v1";

export type CredentialsShape = {
  username: string;
  password: string;
};

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

export function saveCredentials(creds: CredentialsShape) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
}

export function loadCredentials(): CredentialsShape | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CredentialsShape;
    if (parsed.username && parsed.password) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearCredentials() {
  localStorage.removeItem(CREDENTIALS_KEY);
}
