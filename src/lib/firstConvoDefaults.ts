import { defaultReminderDatetime } from "@/lib/datetimeLocal";
import type { FirstConvoPersist } from "@/types";

export function defaultFirstConvo(): FirstConvoPersist {
  return {
    phase: "feel",
    feeling: "",
    audience: "friends",
    topics: "",
    language: "English",
    cultureRegion: "",
    timePreference: "this evening",
    starters: [],
    expandedId: null,
    reminderWhen: defaultReminderDatetime(),
  };
}
