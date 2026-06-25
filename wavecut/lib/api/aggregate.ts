import { FALLBACK, BEACH_IDS } from "@/lib/data/fallback";
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
  const [tide, weather, info, rip, wave, quality, grid] = await Promise.all([
    fetchTide(id), fetchWeather(id), fetchBeachInfo(id),
    fetchRip(id), fetchWave(id), fetchQuality(id), fetchBathymetry(id),
  ]);

  const tideOffsets = {
    now: tide?.nowOffset ?? 0,
    t1: tide?.t1Offset ?? 0.35,
    t2: tide?.t2Offset ?? 0.70,
  };
  const waveHeight = wave?.height ?? info?.waveHeight ?? fb.wave;
  const ripLabel = rip ? rip.level : fb.rip;
  const qualityGrade = quality?.grade ?? "적합";
  const windSpeed = info?.windSpeed ?? weather?.windSpeed ?? 3;
  const tideRising = tide?.rising ?? (fb.tideTrend === "상승");

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
    sky: weather?.sky ?? fb.sky, air: weather?.air ?? fb.air,
    uv: weather?.uv ?? fb.uv, crowd: fb.crowd,
    wave: waveHeight, tide: tide?.label ?? fb.tide,
    tideTrend: tideRising ? "상승" : "하강", rip: ripLabel,
    water: info?.water ?? fb.water, family: fb.family,
    parking: fb.parking, parkDist: fb.parkDist, length: fb.length,
    summary: fb.summary, windSpeed, quality: qualityGrade,
    tideOffsets, transects: fb.transects,
    grid: grid ?? null,
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
