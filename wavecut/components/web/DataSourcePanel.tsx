"use client";

import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./web.module.css";

export function DataSourcePanel() {
  const P = useT().panel;
  const sources = [
    { tag: P.srcDepth, name: P.srcDepthOrg, use: P.srcDepthDesc },
    { tag: P.srcTide, name: P.srcTideOrg, use: P.srcTideDesc },
    { tag: P.srcWave, name: P.srcWaveOrg, use: P.srcWaveDesc },
    { tag: P.srcRip, name: P.srcRipOrg, use: P.srcRipDesc },
    { tag: P.srcWeather, name: P.srcWeatherOrg, use: P.srcWeatherDesc },
  ];
  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>{P.srcTitle}</strong>
        <span className="mono">{P.srcDaily}</span>
      </div>
      <div className={styles.srcList}>
        {sources.map((s, i) => (
          <div key={i} className={styles.srcItem}>
            <span className={`${styles.srcTag} mono`}>{s.tag}</span>
            <div>
              <b>{s.name}</b>
              <span>{s.use}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
