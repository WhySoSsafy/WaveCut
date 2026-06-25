import type { SafetyStatus } from "@/lib/bsm/types";
import { Stat } from "@/components/shared/Stat";
import styles from "./web.module.css";

interface OceanSafetyPanelProps {
  wave: number;
  tide: string;
  tideTrend?: string;
  rip: string;
  family: boolean;
}

function ripStatus(rip: string): SafetyStatus {
  if (rip === "위험") return "danger";
  if (rip === "주의" || rip === "경계" || rip === "관심") return "caution";
  return "safe";
}

export function OceanSafetyPanel({ wave, tide, tideTrend, rip, family }: OceanSafetyPanelProps) {
  const waveStatus: SafetyStatus = wave > 1 ? "caution" : "safe";
  const ripS = ripStatus(rip);
  const famStatus: SafetyStatus = family ? "safe" : "caution";

  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>해양 안전 분석</strong>
        <span className="mono">전문 지표</span>
      </div>
      <div className={styles.safetyMetrics}>
        <Stat icon="wave" label="파고" value={wave} unit="m" status={waveStatus} />
        <Stat
          icon="tide"
          label="조위"
          value={tide}
          unit={tideTrend ? " · " + tideTrend : undefined}
          status="safe"
        />
        <Stat icon="rip" label="이안류" value={rip} status={ripS} />
        <Stat
          icon="family"
          label="가족 이용"
          value={family ? "추천" : "주의"}
          status={famStatus}
        />
      </div>
    </div>
  );
}
