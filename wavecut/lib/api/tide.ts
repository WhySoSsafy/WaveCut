import type { BeachId } from "@/lib/data/fallback";
import { getEnv } from "./env";
import { STATIONS } from "./stations";

export interface TideResult {
  nowOffset: number;
  t1Offset: number;
  t2Offset: number;
  rising: boolean;
  label: string;
}

interface TideRecord {
  record_time: string;
  tide_level: string;
}

// cm 단위 조위를 받아 now 기준 상대 오프셋(m)으로 변환
// TODO: confirm real API schema — key paths may change after API issuance
export function parseTide(json: unknown, nowTime: string): TideResult | null {
  const data = (json as { result?: { data?: unknown } })?.result?.data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const parseCm = (s: unknown): number | null => {
    if (typeof s !== "string") return null;
    const v = parseFloat(s);
    return Number.isFinite(v) ? v : null;
  };

  const isRecord = (x: unknown): x is TideRecord =>
    x != null && typeof x === "object";

  const findLevel = (time: string): number | null => {
    const rec = (data as unknown[]).find(
      (d) => isRecord(d) && (d as TideRecord).record_time === time
    ) as TideRecord | undefined;
    return rec ? parseCm(rec.tide_level) : null;
  };

  const sorted = [...(data as unknown[])]
    .filter(isRecord)
    .map((d) => d as TideRecord)
    .sort((a, b) => a.record_time.localeCompare(b.record_time));
  if (sorted.length === 0) return null;

  const first = sorted[0];
  const nowCm = findLevel(nowTime) ?? parseCm(first.tide_level);
  if (nowCm === null || !Number.isFinite(nowCm)) return null;

  // now 이후 시각 두 개를 1·2시간 후로 사용
  const idx = sorted.findIndex((d) => d.record_time === nowTime);
  const base = idx >= 0 ? idx : 0;
  const s1 = sorted[base + 1];
  const s2 = sorted[base + 2];
  const t1Cm = (s1 != null && isRecord(s1) ? parseCm((s1 as TideRecord).tide_level) : null) ?? nowCm;
  const t2Cm = (s2 != null && isRecord(s2) ? parseCm((s2 as TideRecord).tide_level) : null) ?? t1Cm;

  return {
    nowOffset: 0,
    t1Offset: (t1Cm - nowCm) / 100,
    t2Offset: (t2Cm - nowCm) / 100,
    rising: t2Cm > nowCm,
    label: "중조",
  };
}

export async function fetchTide(id: BeachId): Promise<TideResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnv("DATA_GO_KR_KEY");
    // TODO: confirm real API schema — endpoint confirmed with KHOA; date param may be required
    const url = `https://www.khoa.go.kr/api/oceangrid/tideObs/search.do?ServiceKey=${key}&ObsCode=${st.tideObsCode}&ResultType=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const now = new Date().toISOString().slice(0, 13).replace("T", " ") + ":00:00";
    return parseTide(json, now);
  } catch {
    return null;
  }
}
