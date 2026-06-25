import type { SafetyStatus } from "./types";

export interface ScoreInput {
  dangerStart: number | null;                       // 위험 시작 거리(m), null=없음
  rip: "관심" | "주의" | "경계" | "위험" | "안전";   // 이안류 단계
  waveHeight: number;                               // 파고(m)
  tideRising: boolean;                              // 조위 상승 중
  windSpeed: number;                                // 풍속(m/s)
  quality: "적합" | "주의" | "부적합";                // 수질
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

// 항목별 0~100 점수
function depthScore(dangerStart: number | null): number {
  if (dangerStart === null) return 100;
  // 위험 시작이 가까울수록 위험. 0m→0점, 60m+→100점
  return clamp((dangerStart / 60) * 100);
}
function ripScore(rip: ScoreInput["rip"]): number {
  return { "안전": 100, "관심": 90, "주의": 60, "경계": 30, "위험": 0 }[rip];
}
function waveScore(h: number): number {
  if (h <= 0.5) return 100;
  if (h <= 1.0) return 60;
  if (h <= 1.5) return 20;
  return 0;
}
function tideScore(rising: boolean): number { return rising ? 60 : 100; }
function windScore(w: number): number { return clamp(100 - w * 5); } // 20m/s에서 0점
function qualityScore(q: ScoreInput["quality"]): number {
  return { "적합": 100, "주의": 50, "부적합": 0 }[q];
}

export function computeScore(input: ScoreInput): number {
  const weighted =
    depthScore(input.dangerStart) * 0.30 +
    ripScore(input.rip) * 0.25 +
    waveScore(input.waveHeight) * 0.20 +
    tideScore(input.tideRising) * 0.10 +
    windScore(input.windSpeed) * 0.10 +
    qualityScore(input.quality) * 0.05;
  return Math.round(clamp(weighted));
}

export function statusOf(score: number): SafetyStatus {
  if (score >= 70) return "safe";
  if (score >= 40) return "caution";
  return "danger";
}
