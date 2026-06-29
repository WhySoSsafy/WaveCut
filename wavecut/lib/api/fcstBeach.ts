import type { BeachId } from "@/lib/data/fallback";
import { getEnv } from "./env";

// 국립해양조사원_해수욕지수 조회 (공공데이터포털, 기관코드 1192136)
// 전국 해수욕장의 최고파고·평균수온·평균기온·최대풍속·해수욕지수를 제공.
// 부산 5개 해수욕장만 필터링해 사용한다.
const ENDPOINT =
  "https://apis.data.go.kr/1192136/fcstBeachv2/GetFcstBeachApiServicev2";

const NAME_TO_ID: Record<string, BeachId> = {
  해운대해수욕장: "haeundae",
  광안리해수욕장: "gwangalli",
  송정해수욕장: "songjeong",
  송도해수욕장: "songdo",
  다대포해수욕장: "dadaepo",
  일광해수욕장: "ilgwang",
};

export interface FcstBeachResult {
  wave: number; // 최고파고 (m)
  water: number; // 평균수온 (℃)
  wind: number; // 최대풍속 (m/s)
  index: string; // 해수욕지수 (매우좋음/좋음/보통/나쁨/매우나쁨)
  open: string; // 개장 상태
}

interface RawItem {
  bbchNm: string;
  predcYmd: string;
  predcNoonSeCd: string; // 오전 / 오후 / 일
  maxWvhgt: string;
  avgWtem: string;
  maxWspd: string;
  totalIndex: string;
  opnStat: string;
}

const noonRank = (s: string): number =>
  s === "오전" ? 0 : s === "오후" ? 1 : 2;

// 가장 이른 예측일 + 오전 우선으로 대표 레코드 선택
function isBetter(a: RawItem, b: RawItem): boolean {
  if (a.predcYmd !== b.predcYmd) return a.predcYmd < b.predcYmd;
  return noonRank(a.predcNoonSeCd) < noonRank(b.predcNoonSeCd);
}

function num(s: string): number {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : NaN;
}

// 5페이지(=전국 500건) 병합 후 부산 해변별 대표 레코드 추출.
// 동일 URL fetch 는 Next 가 dedupe/revalidate 캐싱하므로 해변마다 호출해도 실호출은 1회.
export async function fetchAllFcstBeach(): Promise<
  Map<BeachId, FcstBeachResult>
> {
  const key = getEnv("DATA_GO_KR_KEY");
  const pages = [1, 2, 3, 4, 5];
  const all: RawItem[] = [];

  await Promise.all(
    pages.map(async (p) => {
      const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(key)}&numOfRows=100&pageNo=${p}&type=json`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return;
      const json = (await res.json()) as {
        body?: { items?: { item?: unknown } };
      };
      const items = json?.body?.items?.item;
      if (Array.isArray(items)) all.push(...(items as RawItem[]));
    })
  );

  const picked = new Map<BeachId, RawItem>();
  for (const it of all) {
    const id = NAME_TO_ID[it?.bbchNm];
    if (!id) continue;
    const cur = picked.get(id);
    if (!cur || isBetter(it, cur)) picked.set(id, it);
  }

  const out = new Map<BeachId, FcstBeachResult>();
  for (const [id, it] of picked) {
    const wave = num(it.maxWvhgt);
    const water = num(it.avgWtem);
    const wind = num(it.maxWspd);
    if (!Number.isFinite(wave) && !Number.isFinite(water)) continue;
    out.set(id, {
      wave,
      water,
      wind,
      index: it.totalIndex ?? "",
      open: it.opnStat ?? "",
    });
  }
  return out;
}

export async function fetchFcstBeach(
  id: BeachId
): Promise<FcstBeachResult | null> {
  try {
    const all = await fetchAllFcstBeach();
    return all.get(id) ?? null;
  } catch {
    return null;
  }
}
