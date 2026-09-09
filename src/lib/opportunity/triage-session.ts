import { cookies } from "next/headers";

/** Survives Vercel /tmp SQLite instance hop for contest demo walkthroughs. */
export const TRIAGE_COOKIE = "cherry_opp_triage";

export type TriageOverride = "approved" | "discarded";
export type TriageMap = Record<string, TriageOverride>;

export function parseTriageCookie(raw: string | undefined): TriageMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as TriageMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export async function readTriageMap(): Promise<TriageMap> {
  const jar = await cookies();
  return parseTriageCookie(jar.get(TRIAGE_COOKIE)?.value);
}

export function mergeTriageMap(existing: TriageMap, externalId: string, status: TriageOverride): TriageMap {
  return { ...existing, [externalId]: status };
}

export function serializeTriageCookie(map: TriageMap): string {
  return encodeURIComponent(JSON.stringify(map));
}

export function triageCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
  };
}

export function applyTriageOverrides<T extends { external_id: string; triage_status: string }>(
  rows: T[],
  map: TriageMap
): T[] {
  if (Object.keys(map).length === 0) return rows;
  return rows.map((row) => {
    const override = map[row.external_id];
    if (!override) return row;
    return { ...row, triage_status: override };
  });
}
