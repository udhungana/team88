import type { SafetyFlag } from "@/types";

/** Demo-only rules — not a guarantee of safety. */
export const SAFETY_GUIDELINES_VERSION = "mvp-demo-2-rules-ai";

type Rule = {
  id: string;
  severity: SafetyFlag["severity"];
  patterns: RegExp[];
  message: string;
};

const RULES: Rule[] = [
  {
    id: "pii-address",
    severity: "medium",
    patterns: [
      /\b\d{3,5}\s+[\w\s]+(?:street|st\.|avenue|ave|road|rd|drive|dr)\b/i,
      /\bmy address is\b/i,
    ],
    message: "This message may share your address. Consider keeping locations vague in early chats.",
  },
  {
    id: "pii-ssn",
    severity: "high",
    patterns: [/\b\d{3}-\d{2}-\d{4}\b/, /\bssn\b/i, /\bsocial security\b/i],
    message: "Avoid sharing government IDs or SSNs. This is a common scam and identity theft risk.",
  },
  {
    id: "scam-money",
    severity: "high",
    patterns: [
      /\bwire (?:me )?money\b/i,
      /\bgift card\b/i,
      /\bvenmo (?:me|first)\b/i,
      /\bcrypto wallet\b/i,
    ],
    message: "Money or gift-card requests are a frequent scam pattern. Do not send funds to new contacts.",
  },
  {
    id: "scam-platform",
    severity: "medium",
    patterns: [
      /\bmove to whatsapp\b/i,
      /\btelegram (?:only|me there)\b/i,
      /\boff (?:this )?app (?:right )?now\b/i,
    ],
    message: "Pressuring a move to another app can bypass safety tools. Stay here until you trust the person.",
  },
  {
    id: "harassment",
    severity: "high",
    patterns: [/\bkill yourself\b/i, /\b(kys|die)\b/i],
    message: "This language can be harmful. If you’re struggling, use “I need help now” for resources.",
  },
];

export function scanMessage(text: string): SafetyFlag[] {
  const flags: SafetyFlag[] = [];
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(text))) {
      flags.push({
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.message,
        source: "rule",
      });
    }
  }
  return flags;
}

/** Demo phrases for stakeholder testing */
export const SAFETY_DEMO_PHRASES = [
  "My address is 742 Evergreen Terrace",
  "Can you wire money for an emergency?",
  "Let’s move to WhatsApp immediately",
];
