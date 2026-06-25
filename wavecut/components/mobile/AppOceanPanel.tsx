import { Stat } from "@/components/shared/Stat";
import { waveStatus, ripStatus, familyStatus } from "@/lib/bsm/safety";
import styles from "./mobile.module.css";

interface AppOceanPanelProps {
  wave: number;
  tide: string;
  tideTrend?: string;
  rip: string;
  family: boolean;
}

export function AppOceanPanel({ wave, tide, tideTrend, rip, family }: AppOceanPanelProps) {
  const waveS = waveStatus(wave);
  const ripS = ripStatus(rip);
  const famStatus = familyStatus(family);

  return (
    <div className={styles.aPanel}>
      <div className={styles.aPanelH}>
        <strong>해양 안전 분석</strong>
        <span className={styles.aPanelTag}>전문 지표</span>
      </div>
      {/* 2×2 grid — mirrors web OceanSafetyPanel */}
      <div className={styles.aMetricGrid}>
        <Stat icon="wave" label="파고" value={wave} unit="m" status={waveS} />
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
