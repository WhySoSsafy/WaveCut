import type { SafetyStatus } from "./types";

/** 파고(m) 기반 안전 상태 */
export function waveStatus(wave: number): SafetyStatus {
  return wave > 1 ? "caution" : "safe";
}

/** 이안류 단계 문자열 기반 안전 상태 */
export function ripStatus(rip: string): SafetyStatus {
  if (rip === "위험") return "danger";
  if (rip === "주의" || rip === "경계" || rip === "관심") return "caution";
  return "safe";
}

/** 가족 이용 가능 여부 기반 안전 상태 */
export function familyStatus(family: boolean): SafetyStatus {
  return family ? "safe" : "caution";
}
