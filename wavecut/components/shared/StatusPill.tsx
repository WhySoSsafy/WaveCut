import type { SafetyStatus } from "@/lib/bsm/types";
import styles from "./shared.module.css";

export const SC: Record<SafetyStatus, string> = {
  safe: "var(--safe)",
  caution: "var(--caution)",
  danger: "var(--danger)",
};

export const SBG: Record<SafetyStatus, string> = {
  safe: "var(--safe-bg)",
  caution: "var(--caution-bg)",
  danger: "var(--danger-bg)",
};

export const SLABEL: Record<SafetyStatus, string> = {
  safe: "안전",
  caution: "주의",
  danger: "위험",
};

export function StatusPill({
  status,
  children,
  big,
}: {
  status: SafetyStatus;
  children?: React.ReactNode;
  big?: boolean;
}) {
  const pulse = status !== "safe";
  return (
    <span
      className={`${styles.pill}${big ? ` ${styles.pillBig}` : ""}`}
      style={{ color: SC[status], background: SBG[status] }}
    >
      <i
        className={`dot${pulse ? ` ${styles.dotPulse}` : ""}`}
        style={
          {
            background: SC[status],
            "--pulse-color": SC[status],
          } as React.CSSProperties
        }
      />
      {children ?? SLABEL[status]}
    </span>
  );
}
