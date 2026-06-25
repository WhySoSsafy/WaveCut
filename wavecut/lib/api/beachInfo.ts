import type { BeachId } from "@/lib/data/fallback";
import { getEnv } from "./env";
import { STATIONS } from "./stations";

export interface BeachInfoResult {
  waveHeight: number;
  water: number;
  windSpeed: number;
  windDir: string;
}

interface BeachInfoItem {
  waveHeight: string;
  waterTemp: string;
  windSpeed: string;
  windDir: string;
}

// TODO: confirm real API schema — beach info API response shape pending real issuance
export function parseBeachInfo(json: unknown): BeachInfoResult | null {
  const itemArr = (
    json as {
      response?: {
        body?: { items?: { item?: unknown } };
      };
    }
  )?.response?.body?.items?.item;
  if (!Array.isArray(itemArr) || itemArr.length === 0) return null;

  const raw = itemArr[0];
  if (raw == null || typeof raw !== "object") return null;
  const item = raw as BeachInfoItem;

  const waveHeight = parseFloat(item.waveHeight);
  if (!Number.isFinite(waveHeight)) return null;

  const water = parseFloat(item.waterTemp);
  if (!Number.isFinite(water)) return null;

  const windSpeed = parseFloat(item.windSpeed);
  if (!Number.isFinite(windSpeed)) return null;

  return {
    waveHeight,
    water,
    windSpeed,
    windDir: typeof item.windDir === "string" ? item.windDir : "",
  };
}

export async function fetchBeachInfo(id: BeachId): Promise<BeachInfoResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnv("DATA_GO_KR_KEY");
    // TODO: confirm real API schema — beach info endpoint and beachInfoCode usage pending
    const url = `https://apis.data.go.kr/1192000/beachInfo?serviceKey=${key}&beachCode=${st.beachInfoCode}&type=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseBeachInfo(await res.json());
  } catch {
    return null;
  }
}
