import type { CurrentUser, MockPeer } from "@/types";
import { inferMoodEmojiIndex } from "@/lib/inferMoodEmoji";

type Locale = "en" | "ne";

type Pool = { en: string[]; ne: string[] };

const POSITIVE: Pool = {
  en: [
    "I’m in a pretty good headspace today—what’s something small that made you smile lately?",
    "Feeling open to a light chat. Anything on your mind you’d like to share?",
    "I’m trying to stay positive this week—how’s your energy been?",
  ],
  ne: [
    "आज मेरो मन हल्का छ—पछिल्लो दिनमा तपाईंलाई हाँसो ल्याउने सानो कुरा के थियो?",
    "हल्का कुराकानी गर्न मन लागिरहेको छ। केही साझा गर्न मन छ?",
    "यो हप्ता सकारात्मक रहन खोजिरहेको छु—तपाईंको उर्जा कस्तो छ?",
  ],
};

const HEAVY: Pool = {
  en: [
    "It’s been a heavier day on my side—no pressure to go deep, but I’m here to listen if you want to vent too.",
    "I’ve been carrying some stress. If you’re up for it, I’d love a low-key check-in—how are you really doing?",
    "Rough patch lately. Want to swap small wins or just coexist in the chat for a bit?",
  ],
  ne: [
    "आज मेरोतिर अलि गाह्रो दिन छ—गहिरो नजानुपर्ने, तर सुन्न चाहनुहुन्छ भने म यहाँ छु।",
    "केही तनाव बोकेर हिँडेको छु। हल्का कुरा गर्न मिल्छ? वास्तवमै कस्तो हुनुहुन्छ?",
    "पछिल्लो समय गाह्रो छ। साना जित साट्ने वा केही बेर यसै कुराकानीमा बस्ने?",
  ],
};

const REFLECTIVE: Pool = {
  en: [
    "I’m trying to slow down and be present—open to a calm conversation if you are.",
    "Looking for a gentle, judgment-free chat. What’s been taking space in your mind?",
    "I could use a bit of human connection today. What’s one thing you’re grateful for right now?",
  ],
  ne: [
    "अलि ढिलो र हाजिर हुन खोजिरहेको छु—शान्त कुराकानी मिल्छ भने राम्रो हुन्छ।",
    "कोमल, बिना निर्णयको कुरा चाहन्छु। मनमा के घर गरिरहेको छ?",
    "आज अलि मानवीय जडान चाहिएको छ। अहिले तपाईं कृतज्ञ हुनुहुने एउटा कुरा के हो?",
  ],
};

const NEUTRAL: Pool = {
  en: [
    "Hey—thought I’d say hi. How’s your day going so far?",
    "I’m around if you want to chat about nothing in particular.",
    "We matched on some interests—curious what you’re into lately besides what’s on your tags?",
  ],
  ne: [
    "नमस्ते—कस्तो चलिरहेको छ दिन?",
    "विशेष विषय नभए पनि कुरा गर्न मन लागे भने यहाँ छु।",
    "हामी केही रुचिमा मिल्यौं—ट्याग बाहेक पछिल्लो रुचि के छ?",
  ],
};

function moodBucketFromIndex(idx: number): Pool {
  if ([0, 1, 10].includes(idx)) return POSITIVE;
  if ([3, 4, 5, 6, 9].includes(idx)) return HEAVY;
  if ([7, 8, 11].includes(idx)) return REFLECTIVE;
  return NEUTRAL;
}

function hashPick(seed: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % modulo;
}

/** Up to 3 starter lines tailored to the user’s mood + optional overlap with peer. */
export function getMoodBasedChatStarters(
  user: CurrentUser,
  peer: MockPeer,
  locale: Locale
): string[] {
  const combined = `${user.moodText} ${user.feelingText} ${user.moodEmoji}`.trim();
  const idx = inferMoodEmojiIndex(combined || user.feelingText || "okay", 1);
  const pool = moodBucketFromIndex(idx);
  const lines = locale === "ne" ? pool.ne : pool.en;

  const overlap = peer.tags.filter((tag) =>
    user.tags.some((u) => u.toLowerCase() === tag.toLowerCase())
  );
  const overlapLineEn =
    overlap.length > 0
      ? `I saw we both connect on “${overlap[0]}”—want to talk about that or something else today?`
      : null;
  const overlapLineNe =
    overlap.length > 0
      ? `हामी दुवैमा “${overlap[0]}” मिलेजस्तो देखियो—यसै वा अरू केही कुरा गर्ने?`
      : null;

  const start = hashPick(peer.id + user.id, lines.length);
  const out: string[] = [];
  for (let i = 0; i < 3; i++) {
    out.push(lines[(start + i) % lines.length]!);
  }

  if (overlapLineEn && out.length >= 2) {
    const extra = locale === "ne" ? overlapLineNe! : overlapLineEn;
    out[1] = extra;
  }

  return [...new Set(out)].slice(0, 3);
}
