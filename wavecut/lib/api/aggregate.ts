import { FALLBACK, BEACH_IDS, FALLBACK_TIDE_OFFSETS, FALLBACK_QUALITY, FALLBACK_WIND_SPEED } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";
import type { SafetyStatus } from "@/lib/bsm/types";
import type { TransectParams, GridSample } from "@/lib/bsm/profile";
import { profileFromTransect, transectAt, analyze } from "@/lib/bsm/profile";
import { computeScore, statusOf } from "@/lib/bsm/score";
import { fetchTide } from "./tide";
import { fetchWeather } from "./weather";
import { fetchBeachInfo } from "./beachInfo";
import { fetchRip } from "./rip";
import { fetchWave } from "./wave";
import { fetchQuality } from "./quality";
import { fetchBathymetry } from "./bathymetry";

export interface BeachSummary {
  id: string; name: string; region: string;
  status: SafetyStatus; score: number;
  sky: string; air: number; uv: string; crowd: string;
}

export interface BeachDetail extends BeachSummary {
  wave: number; tide: string; tideTrend: string; rip: string;
  water: number; family: boolean; parking: string; parkDist: string;
  length: number; summary: string; windSpeed: number;
  quality: "적합" | "주의" | "부적합";
  tideOffsets: { now: number; t1: number; t2: number };
  transects: TransectParams[];
  grid: { left: GridSample[]; center: GridSample[]; right: GridSample[] } | null;
}

const RIP_TEXT = (lvl: string): "관심" | "주의" | "경계" | "위험" | "안전" =>
  (["관심", "주의", "경계", "위험"].includes(lvl) ? lvl : "안전") as "관심" | "주의" | "경계" | "위험" | "안전";

export async function getBeachDetail(id: BeachId): Promise<BeachDetail> {
  const fb = FALLBACK[id];
  const settled = await Promise.allSettled([
    fetchTide(id), fetchWeather(id), fetchBeachInfo(id),
    fetchRip(id), fetchWave(id), fetchQuality(id), fetchBathymetry(id),
  ]);
  const [tide, weather, info, rip, wave, quality, grid] = settled.map(r =>
    r.status === "fulfilled" ? r.value : null
  );

  const tideOffsets = {
    now: (tide as any)?.nowOffset ?? FALLBACK_TIDE_OFFSETS.now,
    t1: (tide as any)?.t1Offset ?? FALLBACK_TIDE_OFFSETS.t1,
    t2: (tide as any)?.t2Offset ?? FALLBACK_TIDE_OFFSETS.t2,
  };
  const waveHeight = (wave as any)?.height ?? (info as any)?.waveHeight ?? fb.wave;
  const ripLabel = rip ? (rip as any).level : fb.rip;
  const qualityGrade = (quality as any)?.grade ?? FALLBACK_QUALITY;
  const windSpeed = (info as any)?.windSpeed ?? (weather as any)?.windSpeed ?? FALLBACK_WIND_SPEED;
  const tideRising = (tide as any)?.rising ?? (fb.tideTrend === "상승");

  // 중앙 단면 기준 위험시작으로 점수 산정
  const centerBed = profileFromTransect(transectAt(fb.transects, 0.5));
  const { dangerStart } = analyze(centerBed, tideOffsets.now);
  const score = computeScore({
    dangerStart, rip: RIP_TEXT(ripLabel), waveHeight,
    tideRising, windSpeed, quality: qualityGrade,
  });

  return {
    id: fb.id, name: fb.name, region: fb.region,
    status: statusOf(score), score,
    sky: (weather as any)?.sky ?? fb.sky, air: (weather as any)?.air ?? fb.air,
    uv: (weather as any)?.uv ?? fb.uv, crowd: fb.crowd,
    wave: waveHeight, tide: (tide as any)?.label ?? fb.tide,
    tideTrend: tideRising ? "상승" : "하강", rip: ripLabel,
    water: (info as any)?.water ?? fb.water, family: fb.family,
    parking: fb.parking, parkDist: fb.parkDist, length: fb.length,
    summary: fb.summary, windSpeed, quality: qualityGrade,
    tideOffsets, transects: fb.transects,
    grid: (grid as any) ?? null,
  };
}

export async function getBeachSummary(id: BeachId): Promise<BeachSummary> {
  const d = await getBeachDetail(id);
  // 정보 위계: 쉬운 정보만 추출
  return {
    id: d.id, name: d.name, region: d.region,
    status: d.status, score: d.score,
    sky: d.sky, air: d.air, uv: d.uv, crowd: d.crowd,
  };
}

export async function getAllSummaries(): Promise<BeachSummary[]> {
  return Promise.all(BEACH_IDS.map(getBeachSummary));
}
