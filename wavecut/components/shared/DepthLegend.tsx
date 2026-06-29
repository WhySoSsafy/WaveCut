"use client";
import { LEVELS } from "@/lib/bsm/levels";
import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./crossSection.module.css";

export function DepthLegend() {
  const levels = useT().common.levels;
  return (
    <div className={styles.depthLegend}>
      {LEVELS.map((l) => (
        <span key={l.key} className={styles.dlItem}>
          <i style={{ background: l.cssVar }}></i>
          {levels[l.key]}
        </span>
      ))}
    </div>
  );
}
