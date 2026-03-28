export type DisplayMode = "named" | "anonymous";

/** UI + content locale (profile setting). */
export type AppLocale = "en" | "ne";

export type ProfileTagSections = {
  interests: string[];
  hobbies: string[];
  professions: string[];
};

export type CurrentUser = {
  id: string;
  displayMode: DisplayMode;
  legalName?: string;
  displayName: string;
  username: string;
  password: string;
  tags: string[];
  /** When set, profile editor keeps tags in these buckets; `tags` stays the flat list for matching. */
  tagSections?: ProfileTagSections;
  feelingText: string;
  ethnicity: string;
  region: string;
  moodEmoji: string;
  moodText: string;
  lastMoodSubmittedAt: string | null;
  appLanguage: AppLocale;
};

export type MockPeer = {
  id: string;
  username: string;
  tags: string[];
  feelingSnippet: string;
  moodEmoji: string;
};

export type Invite = {
  id: string;
  peerId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  fromSelf: boolean;
  text: string;
  sentAt: string;
  safetyFlags?: SafetyFlag[];
};

export type SafetyFlag = {
  ruleId: string;
  severity: "low" | "medium" | "high";
  message: string;
  /** Rule engine vs optional OpenAI assist (see `src/lib/openai.ts`). */
  source?: "rule" | "ai";
};

export type Thread = {
  id: string;
  peerId: string;
  messages: ChatMessage[];
};

export type FirstConversationInputs = {
  feeling: string;
  audience: "family" | "friends" | "stranger";
  topics: string;
  language: string;
  cultureRegion: string;
  timePreference: string;
};

export type ConversationStarter = {
  id: string;
  text: string;
  whyItWorks: string;
};

export type ScheduledReminder = {
  id: string;
  label: string;
  starterSummary: string;
  createdAt: string;
  /** ISO local datetime string from `<input type="datetime-local" />` */
  scheduledAt?: string;
};

export type DistressMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type FirstConvoPhase = "feel" | "plan" | "results";

export type FirstConvoPersist = {
  phase: FirstConvoPhase;
  feeling: string;
  audience: FirstConversationInputs["audience"];
  topics: string;
  language: string;
  cultureRegion: string;
  timePreference: string;
  starters: ConversationStarter[];
  expandedId: string | null;
  reminderWhen: string;
};
