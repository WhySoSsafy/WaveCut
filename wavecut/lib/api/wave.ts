import type { BeachId } from "@/lib/data/fallback";
import { getEnv } from "./env";
import { STATIONS } from "./stations";

export interface WaveResult {
  height: number;
  dir: string;
  period: number;
}

interface WaveRecord {
  wave_height: string;
  wave_dir: string;
  wave_period: string;
}

// TODO: confirm real API schema — KHOA wave observation API; key paths pending confirmation
export function parseWave(json: unknown): WaveResult | null {
  const data = (json as { result?: { data?: unknown } })?.result?.data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const rawRec = (data as unknown[])[0];
  if (rawRec == null || typeof rawRec !== "object") return null;
  const rec = rawRec as WaveRecord;

  const height = parseFloat(rec.wave_height);
  if (!Number.isFinite(height)) return null;

  const period = parseFloat(rec.wave_period);
  if (!Number.isFinite(period)) return null;

  return {
    height,
    dir: typeof rec.wave_dir === "string" ? rec.wave_dir : "",
    period,
  };
}

export async function fetchWave(id: BeachId): Promise<WaveResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnv("DATA_GO_KR_KEY");
    // TODO: confirm real API schema — KHOA wave forecast grid endpoint; waveGrid code pending
    const url = `https://www.khoa.go.kr/api/oceangrid/waveForcast/search.do?ServiceKey=${key}&GridCode=${st.waveGrid}&ResultType=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseWave(await res.json());
  } catch {
    return null;
  }
}
