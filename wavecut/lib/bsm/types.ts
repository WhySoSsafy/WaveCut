export type SafetyStatus = "safe" | "caution" | "danger";
export type TideKey = "now" | "t1" | "t2";

export interface DepthLevel {
  key: "none" | "ankle" | "knee" | "waist" | "chest" | "head";
  label: string;
  status: SafetyStatus;
  cssVar: string; // 예: "var(--d-knee)"
  min: number;    // 임계 깊이(m)
}
