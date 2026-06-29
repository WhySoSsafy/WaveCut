import type { TransectParams } from "@/lib/bsm/profile";
import type { SafetyStatus } from "@/lib/bsm/types";

export interface BeachStatic {
  id: string; name: string; region: string; length: number;
  family: boolean; feature: boolean; parking: string; parkDist: string;
  summary: string; transects: TransectParams[];
}
export interface BeachFallback extends BeachStatic {
  score: number; status: SafetyStatus; wave: number;
  rip: string; tide: string; tideTrend: string; water: number;
  crowd: string; sky: string; air: number; uv: string;
}

export const BEACH_IDS = ["haeundae", "gwangalli", "songjeong", "songdo", "dadaepo", "ilgwang"] as const;
export type BeachId = typeof BEACH_IDS[number];

export const FALLBACK_TIDE_OFFSETS = { now: 0, t1: 0.35, t2: 0.70 };
export const FALLBACK_QUALITY = "적합" as const;
export const FALLBACK_WIND_SPEED = 3;

export const FALLBACK: Record<BeachId, BeachFallback> = {
  haeundae: {
    id: "haeundae", name: "해운대 해수욕장", region: "부산 해운대구",
    score: 86, status: "safe", wave: 0.5, rip: "주의", tide: "중조", tideTrend: "상승",
    water: 23.4, family: true, feature: true, length: 1.5, crowd: "보통",
    sky: "맑음", air: 27, uv: "높음", parking: "해운대 공영주차장", parkDist: "도보 3분",
    summary: "넓고 완만한 모래턱이 가족 물놀이에 적합합니다.",
    transects: [
      { shelf: 28, shelfDepth: 0.7, slope: 0.06, rip: false },
      { shelf: 42, shelfDepth: 0.75, slope: 0.05, rip: false },
      { shelf: 22, shelfDepth: 0.9, slope: 0.11, rip: true },
    ],
  },
  gwangalli: {
    id: "gwangalli", name: "광안리 해수욕장", region: "부산 수영구",
    score: 78, status: "safe", wave: 0.6, rip: "안전", tide: "중조", tideTrend: "상승",
    water: 23.0, family: true, feature: false, length: 1.4, crowd: "많음",
    sky: "구름조금", air: 26, uv: "보통", parking: "광안리 해변주차장", parkDist: "도보 5분",
    summary: "야간 이용객이 많아 안전요원 안내를 따르세요.",
    transects: [
      { shelf: 24, shelfDepth: 0.8, slope: 0.07, rip: false },
      { shelf: 30, shelfDepth: 0.85, slope: 0.07, rip: false },
      { shelf: 20, shelfDepth: 0.95, slope: 0.1, rip: false },
    ],
  },
  songjeong: {
    id: "songjeong", name: "송정 해수욕장", region: "부산 해운대구",
    score: 69, status: "caution", wave: 1.1, rip: "주의", tide: "대조", tideTrend: "상승",
    water: 22.1, family: false, feature: false, length: 1.2, crowd: "보통",
    sky: "흐림", air: 24, uv: "보통", parking: "송정 공영주차장", parkDist: "도보 4분",
    summary: "파고가 높아 서핑 구역과 물놀이 구역을 구분하세요.",
    transects: [
      { shelf: 18, shelfDepth: 0.9, slope: 0.12, rip: true },
      { shelf: 22, shelfDepth: 0.95, slope: 0.1, rip: false },
      { shelf: 16, shelfDepth: 1.0, slope: 0.14, rip: true },
    ],
  },
  songdo: {
    id: "songdo", name: "송도 해수욕장", region: "부산 서구",
    score: 82, status: "safe", wave: 0.4, rip: "안전", tide: "소조", tideTrend: "하강",
    water: 23.8, family: true, feature: false, length: 0.8, crowd: "여유",
    sky: "맑음", air: 26, uv: "높음", parking: "송도 해수욕장주차장", parkDist: "도보 2분",
    summary: "내만형 지형으로 파도가 잔잔합니다.",
    transects: [
      { shelf: 30, shelfDepth: 0.7, slope: 0.05, rip: false },
      { shelf: 34, shelfDepth: 0.7, slope: 0.05, rip: false },
      { shelf: 26, shelfDepth: 0.8, slope: 0.07, rip: false },
    ],
  },
  dadaepo: {
    id: "dadaepo", name: "다대포 해수욕장", region: "부산 사하구",
    score: 58, status: "caution", wave: 0.9, rip: "위험", tide: "대조", tideTrend: "상승",
    water: 22.6, family: false, feature: false, length: 0.9, crowd: "보통",
    sky: "구름많음", air: 25, uv: "보통", parking: "다대포 해변공영주차장", parkDist: "도보 6분",
    summary: "조수간만 차가 커 갯골·이안류 주의가 필요합니다.",
    transects: [
      { shelf: 40, shelfDepth: 0.6, slope: 0.04, rip: true },
      { shelf: 14, shelfDepth: 1.1, slope: 0.16, rip: true },
      { shelf: 36, shelfDepth: 0.65, slope: 0.05, rip: true },
    ],
  },
  ilgwang: {
    id: "ilgwang", name: "일광 해수욕장", region: "부산 기장군",
    score: 80, status: "safe", wave: 0.3, rip: "안전", tide: "중조", tideTrend: "상승",
    water: 22.4, family: true, feature: false, length: 0.8, crowd: "여유",
    sky: "맑음", air: 24, uv: "보통", parking: "일광해수욕장 공영주차장", parkDist: "도보 3분",
    summary: "수심이 완만하고 잔잔해 가족·아이 물놀이에 좋습니다.",
    transects: [
      { shelf: 36, shelfDepth: 0.6, slope: 0.05, rip: false },
      { shelf: 40, shelfDepth: 0.65, slope: 0.04, rip: false },
      { shelf: 30, shelfDepth: 0.7, slope: 0.06, rip: false },
    ],
  },
};
