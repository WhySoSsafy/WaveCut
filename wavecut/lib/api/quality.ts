import type { BeachId } from "@/lib/data/fallback";
import { STATIONS } from "./stations";
import { getEnv } from "./env";

export interface QualityResult {
  grade: "적합" | "주의" | "부적합";
}

// TODO: confirm real API schema — grade string values may differ from real response
export function parseQuality(json: unknown): QualityResult | null {
  const rawItems = (json as { items?: unknown })?.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) return null;

  const item = rawItems[0] as { grade?: string };
  if (!item?.grade) return null;

  const g = item.grade;
  if (g === "적합" || g === "주의" || g === "부적합") return { grade: g };
  return { grade: "주의" };
}

export async function fetchQuality(id: BeachId): Promise<QualityResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnv("DATA_GO_KR_KEY");
    // TODO: confirm real API schema — Busan water quality API URL and params pending
    const url = `https://apis.data.go.kr/waterQuality?serviceKey=${key}&siteCode=${st.qualityCode}&type=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseQuality(await res.json());
  } catch {
    return null;
  }
}
