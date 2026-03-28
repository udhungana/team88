export type Helpline = { name: string; number: string; note?: string };

export const REGIONS: { id: string; label: string; helplines: Helpline[]; links: { label: string; url: string }[] }[] =
  [
    {
      id: "us",
      label: "United States",
      helplines: [
        { name: "988 Suicide & Crisis Lifeline", number: "988", note: "Call or text; 24/7" },
        { name: "Crisis Text Line", number: "Text HOME to 741741" },
      ],
      links: [
        { label: "SAMHSA treatment locator", url: "https://findtreatment.samhsa.gov/" },
        { label: "MentalHealth.gov", url: "https://www.mentalhealth.gov/" },
      ],
    },
    {
      id: "uk",
      label: "United Kingdom",
      helplines: [
        { name: "Samaritans", number: "116 123", note: "Free, 24/7" },
        { name: "Shout (crisis text)", number: "Text SHOUT to 85258" },
      ],
      links: [
        { label: "NHS urgent mental health", url: "https://www.nhs.uk/nhs-services/mental-health-services/get-urgent-help-for-mental-health/" },
      ],
    },
    {
      id: "ca",
      label: "Canada",
      helplines: [
        { name: "Talk Suicide Canada", number: "988", note: "Call or text" },
        { name: "Kids Help Phone", number: "1-800-668-6868" },
      ],
      links: [
        { label: "CMHA resources", url: "https://cmha.ca/" },
      ],
    },
    {
      id: "in",
      label: "India",
      helplines: [
        { name: "iCall (TISS)", number: "9152987821", note: "Psychosocial helpline" },
        { name: "Vandrevala Foundation", number: "1860-2662-345 / 1800-2333-330" },
      ],
      links: [
        { label: "MHFA India — helplines list", url: "https://www.mhfaindia.org/mhfa-india-helpline" },
      ],
    },
    {
      id: "other",
      label: "Other / prefer not to say",
      helplines: [
        { name: "Local emergency", number: "Your country’s emergency number (e.g. 911, 999, 112)" },
      ],
      links: [
        { label: "Find a Helpline (global directory)", url: "https://findahelpline.com/" },
      ],
    },
  ];

export function getRegion(id: string) {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[REGIONS.length - 1]!;
}

export function distressReply(userText: string, regionId: string): string {
  const t = userText.toLowerCase();
  const region = getRegion(regionId);

  if (/\b(hurt myself|suicide|end it|kill myself|can't go on)\b/i.test(userText)) {
    return `I’m really glad you said something. If you might act on these thoughts, please contact local emergency services immediately.\n\nIn **${region.label}**, you can reach:\n${region.helplines.map((h) => `• **${h.name}** — ${h.number}${h.note ? ` (${h.note})` : ""}`).join("\n")}\n\nThis demo is not a crisis service. A licensed professional is the right support for ongoing risk.`;
  }

  if (/\b(panic|can't breathe|heart racing)\b/i.test(t)) {
    return `That sounds physically intense. Try grounding for a minute: name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste. If symptoms feel like a medical emergency, call your local emergency number.\n\nFor emotional support in **${region.label}**, consider:\n${region.helplines.slice(0, 2).map((h) => `• ${h.name}: ${h.number}`).join("\n")}`;
  }

  if (/\b(lonely|alone|isolated)\b/i.test(t)) {
    return `Loneliness hits hard—even when you’re around people. Small steps help: one message to someone safe, a short walk, or using the Connections tab here for a low-pressure chat.\n\nIf it ever spikes into hopelessness, use the helplines for **${region.label}** listed below.`;
  }

  return `Thanks for sharing that. This assistant is a **demo** and not medical advice. If you’re in immediate danger, call your local emergency number.\n\nFor **${region.label}**, here are starting points:\n${region.helplines.map((h) => `• **${h.name}** — ${h.number}`).join("\n")}\n\nIf symptoms persist or worsen, consider reaching out to a licensed clinician.`;
}
