"use client";

import { Stat } from "@/components/shared/Stat";
import { waveStatus, ripStatus, familyStatus } from "@/lib/bsm/safety";
import { useT } from "@/lib/i18n/LocaleProvider";
import { tv } from "@/lib/i18n/values";
import styles from "./mobile.module.css";

interface AppOceanPanelProps {
  wave: number;
  tide: string;
  tideTrend?: string;
  rip: string;
  family: boolean;
}

export function AppOceanPanel({ wave, tide, tideTrend, rip, family }: AppOceanPanelProps) {
  const t = useT();
  const P = t.panel;
  const waveS = waveStatus(wave);
  const ripS = ripStatus(rip);
  const famStatus = familyStatus(family);

  return (
    <div className={styles.aPanel}>
      <div className={styles.aPanelH}>
        <strong>{P.oceanTitle}</strong>
        <span className={styles.aPanelTag}>{P.oceanExpert}</span>
      </div>
      {/* 2×2 grid — mirrors web OceanSafetyPanel */}
      <div className={styles.aMetricGrid}>
        <Stat icon="wave" label={P.wave} value={wave} unit="m" status={waveS} />
        <Stat
          icon="tide"
          label={P.tide}
          value={tv(t, "tide", tide)}
          unit={tideTrend ? " · " + tv(t, "tideTrend", tideTrend) : undefined}
          status="safe"
        />
        <Stat icon="rip" label={P.rip} value={tv(t, "rip", rip)} status={ripS} />
        <Stat
          icon="family"
          label={P.family}
          value={tv(t, "family", family ? "추천" : "주의")}
          status={famStatus}
        />
      </div>
    </div>
  );
}
