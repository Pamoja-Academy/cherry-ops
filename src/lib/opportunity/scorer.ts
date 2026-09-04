import type { MediaProfile } from "./profile";
import { RED_CHERRY_MEDIA_PROFILE } from "./profile";

export type ScoreInput = {
  title: string;
  description?: string | null;
  issuer?: string | null;
  category?: string | null;
  province?: string | null;
  estimatedValue?: number | null;
};

export type ScoreResult = {
  score: number;
  band: "pursue" | "review" | "discard";
  breakdown: Record<string, number | string>;
};

function matchTerms(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase();
  const hits: string[] = [];
  for (const n of needles) {
    if (!n?.trim()) continue;
    const term = n.toLowerCase().trim();
    if (term.includes(" ")) {
      if (lower.includes(term) && !hits.includes(n)) hits.push(n);
      continue;
    }
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (re.test(lower) && !hits.includes(n)) hits.push(n);
  }
  return hits;
}

function isCancellationOrMeta(title: string, description?: string | null): boolean {
  const t = `${title} ${description ?? ""}`.toLowerCase();
  return (
    /\bcancell?ation\b/.test(t) ||
    /\bcancelled\b/.test(t) ||
    /\bbidders?\s+list\b/.test(t) ||
    /\btender\s+list\b/.test(t)
  );
}

/** Fit score against Red Cherry media profile — no lab/industrial gates. */
export function scoreBrief(
  input: ScoreInput,
  profile: MediaProfile = RED_CHERRY_MEDIA_PROFILE
): ScoreResult {
  const productText = [input.title, input.description, input.category].filter(Boolean).join(" ");

  const matchedKeywords = matchTerms(productText, profile.keywords);
  const matchedExclude = matchTerms(productText, profile.exclude);
  const matchedIssuers = matchTerms(input.issuer ?? "", profile.issuers);
  const matchedCaps = matchTerms(productText, profile.capabilities);
  const provinceHit =
    !input.province ||
    profile.provinces.length === 0 ||
    profile.provinces.some((p) => (input.province ?? "").toLowerCase().includes(p.toLowerCase())) ||
    input.province.toLowerCase() === "national";

  let score = 15;
  const breakdown: Record<string, number | string> = { base: 15 };

  if (isCancellationOrMeta(input.title, input.description)) {
    score -= 40;
    breakdown.cancellationMeta = -40;
  }

  const keywordPts =
    matchedKeywords.length === 0
      ? 0
      : Math.min(45, 17 + (matchedKeywords.length - 1) * 9);
  score += keywordPts;
  breakdown.keywords = keywordPts;
  breakdown.matchedKeywords = matchedKeywords.join(", ") || "none";

  const capPts = Math.min(20, matchedCaps.length * 6);
  score += capPts;
  breakdown.capabilities = capPts;
  breakdown.matchedCapabilities = matchedCaps.join(", ") || "none";

  const relevanceHits = matchedKeywords.length + matchedCaps.length;

  let issuerPts = 0;
  if (matchedIssuers.length > 0 && relevanceHits > 0) {
    issuerPts = 15;
  }
  score += issuerPts;
  breakdown.issuer = issuerPts;
  breakdown.matchedIssuers = matchedIssuers.join(", ") || "none";

  if (provinceHit && relevanceHits > 0) {
    score += 8;
    breakdown.province = 8;
  } else if (!provinceHit) {
    score -= 10;
    breakdown.province = -10;
  } else {
    breakdown.province = 0;
  }

  if (matchedExclude.length > 0) {
    const penalty = Math.min(50, matchedExclude.length * 18);
    score -= penalty;
    breakdown.excludePenalty = -penalty;
    breakdown.matchedExclude = matchedExclude.join(", ");
  }

  if (input.estimatedValue != null) {
    if (input.estimatedValue < profile.minValueZar) {
      score -= 15;
      breakdown.value = -15;
    } else if (input.estimatedValue > profile.maxValueZar) {
      score -= 10;
      breakdown.value = -10;
    } else if (relevanceHits > 0) {
      score += 5;
      breakdown.value = 5;
    }
  }

  if (relevanceHits === 0) {
    score = Math.min(score, 28);
    breakdown.relevanceGate = "no media keyword/capability hits — capped below review";
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const band = score >= 70 ? "pursue" : score >= 40 ? "review" : "discard";
  breakdown.band = band;

  return { score, band, breakdown };
}

export function scoreBand(score: number): "pursue" | "review" | "discard" {
  if (score >= 70) return "pursue";
  if (score >= 40) return "review";
  return "discard";
}
