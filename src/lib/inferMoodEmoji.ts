/**
 * Pick the closest mood carousel index (0–11) from free-text mood input.
 * Uses keyword / substring scoring (English + some Nepali). Demo heuristic, not clinical.
 */

const MOOD_KEYWORD_GROUPS: string[][] = [
  // 0 😀 joyful
  [
    "joy",
    "joyful",
    "happy",
    "happiness",
    "excited",
    "excitement",
    "elated",
    "cheerful",
    "thrilled",
    "ecstatic",
    "great mood",
    "feeling great",
    "amazing",
    "wonderful",
    "fantastic",
    "euphoric",
    "grinning",
    "खुसी",
    "खुशी",
    "प्रसन्न",
  ],
  // 1 🙂 generally good
  [
    "good",
    "fine",
    "okay",
    "ok",
    "alright",
    "all right",
    "pretty well",
    "not bad",
    "decent",
    "positive",
    "content",
    "stable",
    "ठीक",
    "राम्रो",
  ],
  // 2 😐 neutral
  [
    "neutral",
    "meh",
    "numb",
    "flat",
    "nothing",
    "whatever",
    "idk",
    "unsure",
    "mixed",
    "in between",
    "so-so",
    "so so",
    "average",
    "normal",
    "okay i guess",
  ],
  // 3 😔 down / low
  [
    "down",
    "low",
    "blue",
    "gloomy",
    "depressed",
    "depression",
    "empty",
    "hopeless",
    "discouraged",
    "defeated",
    "melancholy",
    "heavy heart",
    "निराश",
    "उदास",
    "हताश",
  ],
  // 4 😣 stressed / tense
  [
    "stress",
    "stressed",
    "tense",
    "tension",
    "anxious",
    "anxiety",
    "worried",
    "worry",
    "overwhelmed",
    "pressure",
    "panic",
    "frazzled",
    "on edge",
    "nervous",
    "restless",
    "चिन्ता",
    "तनाव",
    "घबराहट",
  ],
  // 5 😢 sad / tearful
  [
    "sad",
    "sadness",
    "cry",
    "crying",
    "tears",
    "tearful",
    "hurt",
    "heartbroken",
    "grieving",
    "grief",
    "mourning",
    "lonely cry",
    "sobbing",
    "दुःखी",
    "रुनु",
  ],
  // 6 😤 frustrated / angry
  [
    "frustrated",
    "frustration",
    "annoyed",
    "angry",
    "anger",
    "mad",
    "irritated",
    "rage",
    "furious",
    "resentful",
    "pissed",
    "fed up",
    "रिस",
    "रिसाएको",
    "चिढिएको",
  ],
  // 7 🌿 calm / grounded
  [
    "calm",
    "calmness",
    "peaceful",
    "peace",
    "grounded",
    "relaxed",
    "serene",
    "tranquil",
    "chill",
    "zen",
    "centered",
    "still",
    "quiet inside",
    "शान्त",
    "शांत",
    "आराम",
  ],
  // 8 💙 need support / care
  [
    "need support",
    "need help",
    "support",
    "hug",
    "lonely",
    "alone",
    "isolated",
    "vulnerable",
    "scared",
    "afraid",
    "unsafe",
    "listening",
    "someone to talk",
    "मद्दत",
    "एक्लो",
    "डर",
  ],
  // 9 🌙 tired / night / evening low
  [
    "tired",
    "exhausted",
    "fatigue",
    "sleepy",
    "insomnia",
    "night",
    "evening",
    "can't sleep",
    "cant sleep",
    "burnt out",
    "burned out",
    "drained",
    "weary",
    "थाकेको",
    "निद्रा",
    "रात",
  ],
  // 10 ✨ hopeful (avoid bare "hope" — matches "hopeless")
  [
    "hopeful",
    "hopefully",
    "hoping for",
    "i'm hoping",
    "im hoping",
    "optimistic",
    "optimism",
    "better soon",
    "looking up",
    "cautiously optimistic",
    "light at the end",
    "healing",
    "recovering",
    "things will get better",
    "आशावादी",
    "आशा छ",
  ],
  // 11 🧘 mindful / meditation
  [
    "mindful",
    "mindfulness",
    "meditat",
    "breath",
    "breathing",
    "present",
    "aware",
    "body scan",
    "yoga",
    "ध्यान",
  ],
];

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordScore(text: string, keyword: string): number {
  const lower = text.toLowerCase();
  const k = keyword.toLowerCase().trim();
  if (!k) return 0;

  if (k.length <= 2) {
    return new RegExp(`\\b${escapeRe(k)}\\b`, "iu").test(text) ? 1.5 : 0;
  }

  if (k.length <= 4 && /^[a-z]+$/i.test(k)) {
    const re = new RegExp(`\\b${escapeRe(k)}\\b`, "iu");
    if (re.test(text)) return 2 + k.length * 0.05;
  }

  if (lower.includes(k)) return 1.5 + Math.min(k.length * 0.08, 2);

  return 0;
}

/** Returns best index 0..MOOD_KEYWORD_GROUPS.length-1, or `fallback` if no signal. */
export function inferMoodEmojiIndex(text: string, fallback = 1): number {
  const trimmed = text.trim();
  if (!trimmed) return fallback;

  let bestIdx = fallback;
  let bestScore = 0;

  MOOD_KEYWORD_GROUPS.forEach((keywords, idx) => {
    let s = 0;
    for (const kw of keywords) {
      s += keywordScore(trimmed, kw);
    }
    if (s > bestScore) {
      bestScore = s;
      bestIdx = idx;
    }
  });

  if (bestScore < 0.75) return fallback;

  return bestIdx;
}

