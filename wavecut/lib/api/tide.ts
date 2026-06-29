import { FALLBACK, type BeachId } from "@/lib/data/fallback";
import { getEnv } from "./env";

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
    .filter((d) => typeof d.record_time === "string" && d.tide_level != null)
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

// 국립해양조사원_조위관측소 실측·예측 조위 조회 (공공데이터포털, 기관코드 1192136).
// 부산 5개 해변은 모두 '부산'(DT_0005) 관측소가 가장 가깝다. `tdlvHgt`(예측 조위, cm)는
// 미래 시각까지 채워져 있어 현재/1시간 후/2시간 후 조위 변화를 그대로 쓸 수 있다.
const TIDE_ENDPOINT =
  "https://apis.data.go.kr/1192136/surveyTideLevel/GetSurveyTideLevelApiService";
const BUSAN_OBS = "DT_0005";

const pad = (n: number) => String(n).padStart(2, "0");

export async function fetchTide(id: BeachId): Promise<TideResult | null> {
  try {
    const key = getEnv("DATA_GO_KR_KEY");
    const kst = new Date(Date.now() + 9 * 3600 * 1000);
    const date = `${kst.getUTCFullYear()}${pad(kst.getUTCMonth() + 1)}${pad(kst.getUTCDate())}`;
    const nowMin = kst.getUTCHours() * 60 + kst.getUTCMinutes();
    const targets = [nowMin, nowMin + 60, nowMin + 120].map((m) =>
      Math.min(m, 1439)
    );
    const pages = [...new Set(targets.map((m) => Math.floor(m / 100) + 1))];

    const level = new Map<number, number>();
    await Promise.all(
      pages.map(async (p) => {
        const url = `${TIDE_ENDPOINT}?serviceKey=${encodeURIComponent(key)}&obsCode=${BUSAN_OBS}&date=${date}&type=json&numOfRows=100&pageNo=${p}`;
        const res = await fetch(url, { next: { revalidate: 1800 } });
        if (!res.ok) return;
        const json = (await res.json()) as {
          body?: { items?: { item?: unknown } };
        };
        const items = json?.body?.items?.item;
        if (!Array.isArray(items)) return;
        for (const it of items as { obsrvnDt?: string; tdlvHgt?: unknown }[]) {
          const hm = typeof it?.obsrvnDt === "string" ? it.obsrvnDt.slice(11, 16) : "";
          if (hm.length !== 5) continue;
          const m = parseInt(hm.slice(0, 2), 10) * 60 + parseInt(hm.slice(3, 5), 10);
          const v =
            typeof it.tdlvHgt === "number" ? it.tdlvHgt : parseFloat(String(it.tdlvHgt));
          if (Number.isFinite(v) && Number.isFinite(m)) level.set(m, v);
        }
      })
    );

    const at = (m: number): number | undefined =>
      level.get(m) ??
      level.get(m - 1) ??
      level.get(m + 1) ??
      level.get(m - 2) ??
      level.get(m + 2);

    const nowCm = at(targets[0]);
    if (nowCm == null) return null;
    const t1Cm = at(targets[1]) ?? nowCm;
    const t2Cm = at(targets[2]) ?? t1Cm;

    return {
      nowOffset: 0,
      t1Offset: +((t1Cm - nowCm) / 100).toFixed(2),
      t2Offset: +((t2Cm - nowCm) / 100).toFixed(2),
      rising: t2Cm >= nowCm,
      label: FALLBACK[id].tide,
    };
  } catch {
    return null;
  }
}
