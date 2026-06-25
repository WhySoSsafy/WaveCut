import type { DepthLevel } from "./types";

export const LEVELS: DepthLevel[] = [
  { key: "none",  label: "물 없음",   status: "safe",    cssVar: "var(--d-none)",  min: -99 },
  { key: "ankle", label: "발목",      status: "safe",    cssVar: "var(--d-ankle)", min: 0   },
  { key: "knee",  label: "무릎",      status: "safe",    cssVar: "var(--d-knee)",  min: 0.3 },
  { key: "waist", label: "허리",      status: "caution", cssVar: "var(--d-waist)", min: 0.6 },
  { key: "chest", label: "가슴",      status: "caution", cssVar: "var(--d-chest)", min: 1.0 },
  { key: "head",  label: "머리 이상", status: "danger",  cssVar: "var(--d-head)",  min: 1.5 },
];

export function levelOf(depth: number): DepthLevel {
  if (depth <= 0.02) return LEVELS[0];
  let result = LEVELS[1];
  for (const lv of LEVELS) if (depth >= lv.min) result = lv;
  return result;
}
