import type { BeachId } from "@/lib/data/fallback";
import { getEnv } from "./env";
import { STATIONS } from "./stations";

export interface RipResult {
  level: "관심" | "주의" | "경계" | "위험";
}

const RIP_LEVELS = ["관심", "주의", "경계", "위험"] as const;

// TODO: confirm real API schema — item key and rip_index field name pending real response
export function parseRip(json: unknown): RipResult | null {
  const item = (
    json as {
      response?: {
        body?: { items?: { item?: Array<{ rip_index?: string }> } };
      };
    }
  )?.response?.body?.items?.item?.[0];
  if (!item || item.rip_index === undefined || item.rip_index === null) return null;

  const trimmed = String(item.rip_index).trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const raw = parseInt(trimmed, 10);
  if (!Number.isFinite(raw)) return null;

  const idx = Math.max(0, Math.min(3, raw));
  return { level: RIP_LEVELS[idx] };
}

export async function fetchRip(id: BeachId): Promise<RipResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnv("DATA_GO_KR_KEY");
    // TODO: confirm real API schema — beachCode and endpoint path may change
    const url = `https://apis.data.go.kr/1192136/ripCurrent?serviceKey=${key}&beachCode=${st.ripCode}&type=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseRip(await res.json());
  } catch {
    return null;
  }
}
