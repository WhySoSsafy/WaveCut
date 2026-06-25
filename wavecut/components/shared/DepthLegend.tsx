"use client";
import { LEVELS } from "@/lib/bsm/levels";
import styles from "./crossSection.module.css";

export function DepthLegend() {
  return (
    <div className={styles.depthLegend}>
      {LEVELS.map((l) => (
        <span key={l.key} className={styles.dlItem}>
          <i style={{ background: l.cssVar }}></i>
          {l.label}
        </span>
      ))}
    </div>
  );
}
