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
  const data = (json as { result?: { data?: TideRecord[] } })?.result?.data;
  if (!data || data.length === 0) return null;

  const findLevel = (time: string): number | null => {
    const rec = data.find((d) => d.record_time === time);
    return rec ? parseFloat(rec.tide_level) : null;
  };

  const sorted = [...data].sort((a, b) => a.record_time.localeCompare(b.record_time));
  const nowCm = findLevel(nowTime) ?? parseFloat(sorted[0].tide_level);

  // now 이후 시각 두 개를 1·2시간 후로 사용
  const idx = sorted.findIndex((d) => d.record_time === nowTime);
  const base = idx >= 0 ? idx : 0;
  const t1Cm = sorted[base + 1] ? parseFloat(sorted[base + 1].tide_level) : nowCm;
  const t2Cm = sorted[base + 2] ? parseFloat(sorted[base + 2].tide_level) : t1Cm;

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
