"use client";

import { Stat } from "@/components/shared/Stat";
import { waveStatus, ripStatus, familyStatus } from "@/lib/bsm/safety";
import { useT } from "@/lib/i18n/LocaleProvider";
import { tv } from "@/lib/i18n/values";
import styles from "./web.module.css";

interface OceanSafetyPanelProps {
  wave: number;
  tide: string;
  tideTrend?: string;
  rip: string;
  family: boolean;
}

export function OceanSafetyPanel({ wave, tide, tideTrend, rip, family }: OceanSafetyPanelProps) {
  const t = useT();
  const P = t.panel;
  const waveS = waveStatus(wave);
  const ripS = ripStatus(rip);
  const famStatus = familyStatus(family);

  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>{P.oceanTitle}</strong>
        <span className="mono">{P.oceanExpert}</span>
      </div>
      <div className={styles.safetyMetrics}>
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
      {ripS !== "safe" && (
        <div
          className={`${styles.ripFlow}${ripS === "danger" ? " " + styles.ripFlowDanger : ""}`}
        >
          <span className={styles.ripFlowTrack} aria-hidden="true" />
          <span className={styles.ripFlowLabel}>
            {P.ripFlow} {tv(t, "rip", rip)} {P.ripFlowTail}
          </span>
        </div>
      )}
    </div>
  );
}
