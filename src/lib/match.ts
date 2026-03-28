import type { MockPeer } from "@/types";

export type ScoredPeer = MockPeer & { overlap: number; matchedTags: string[] };

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "it",
  "im",
  "i",
  "feeling",
  "feel",
  "bit",
  "little",
  "very",
  "so",
  "just",
]);

export function tokenizeMoodText(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function moodOverlapScore(peer: ScoredPeer, tokens: Set<string>): number {
  if (tokens.size === 0) return 0;
  const hay = `${peer.feelingSnippet} ${peer.tags.join(" ")}`.toLowerCase();
  let n = 0;
  for (const t of tokens) {
    if (hay.includes(t)) n++;
  }
  return n;
}

/** Re-rank peers when the user typed a mood — simulates “softer” interest/mood matching on top of tags. */
export function rankPeersByMood(peers: ScoredPeer[], moodText: string): ScoredPeer[] {
  const tokens = new Set(tokenizeMoodText(moodText));
  if (tokens.size === 0) return [...peers];

  return [...peers].sort((a, b) => {
    const ma = moodOverlapScore(a, tokens);
    const mb = moodOverlapScore(b, tokens);
    if (mb !== ma) return mb - ma;
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    return a.username.localeCompare(b.username);
  });
}

export function scorePeers(myTags: string[], peers: MockPeer[]): ScoredPeer[] {
  const set = new Set(myTags.map((t) => t.trim().toLowerCase()).filter(Boolean));
  return peers
    .map((p) => {
      const matchedTags = p.tags.filter((t) => set.has(t.toLowerCase()));
      return { ...p, overlap: matchedTags.length, matchedTags };
    })
    .sort((a, b) => b.overlap - a.overlap || a.username.localeCompare(b.username));
}
