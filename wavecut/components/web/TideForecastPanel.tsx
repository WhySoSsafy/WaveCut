"use client";

import { Icon } from "@/components/shared/Icon";
import { TideSparkline } from "./TideSparkline";
import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./web.module.css";

interface TideOffsets {
  now: number;
  t1: number;
  t2: number;
}

interface TideForecastPanelProps {
  offsets: TideOffsets;
}

const DEPTH_KEYS = [
  { max: 0.4, key: "ankle" },
  { max: 0.7, key: "knee" },
  { max: 1.1, key: "waist" },
  { max: 1.5, key: "chest" },
  { max: Infinity, key: "head" },
] as const;

const COLORS = ["var(--d-knee)", "var(--d-waist)", "var(--d-chest)"];
const MAX = 1.5;

export function TideForecastPanel({ offsets }: TideForecastPanelProps) {
  const t = useT();
  const P = t.panel;
  const levels = t.common.levels;
  const depthLabel = (offset: number): string => {
    const total = 0.8 + offset;
    for (const { max, key } of DEPTH_KEYS) if (total < max) return levels[key];
    return levels.head;
  };
  const rows = [
    { label: t.xsec.now, offset: offsets.now, isNow: true },
    { label: t.xsec.t1, offset: offsets.t1, isNow: false },
    { label: t.xsec.t2, offset: offsets.t2, isNow: false },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>{P.tideTitle}</strong>
        <span className="mono">{P.tidePred}</span>
      </div>
      <TideSparkline
        points={rows.map((r) => ({
          label: r.label,
          h: +(0.8 + r.offset).toFixed(2),
        }))}
      />
      <div className={styles.tideRows}>
        {rows.map((r, i) => {
          const h = +(0.8 + r.offset).toFixed(2);
          const pct = Math.min((h / MAX) * 100, 100);
          return (
            <div key={i} className={`${styles.tideRow}${r.isNow ? " " + styles.tideRowNow : ""}`}>
              <span className={`${styles.tideT} mono`}>{r.label}</span>
              <div className={styles.tideBar}>
                <i style={{ width: pct + "%", background: COLORS[i] ?? COLORS[2] }} />
              </div>
              <span className={styles.tideD}>
                {depthLabel(r.offset)}
                <em className="mono"> {h}m</em>
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.tideNote}>
        <Icon name="tide" size={14} color="var(--blue-600)" />
        {P.tideNote}
      </div>
    </div>
  );
}
