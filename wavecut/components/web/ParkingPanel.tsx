"use client";

import { Icon } from "@/components/shared/Icon";
import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./web.module.css";

interface ParkingPanelProps {
  parking: string;
  parkDist: string;
}

export function ParkingPanel({ parking, parkDist }: ParkingPanelProps) {
  const P = useT().panel;
  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>{P.parkTitle}</strong>
        <span className="mono">{P.parkSite}</span>
      </div>
      <div className={styles.parkRow}>
        <span className={styles.parkIc}>
          <Icon name="car" size={18} color="var(--blue-600)" />
        </span>
        <div className={styles.parkInfo}>
          <b>{parking}</b>
          <span className="mono">{parkDist}</span>
        </div>
      </div>
      <div className={styles.parkActions}>
        <button className={`${styles.btnGhost} ${styles.btnSm}`}>{P.parkNearby}</button>
        <button className={`${styles.btnGhost} ${styles.btnSm}`}>{P.parkMap}</button>
      </div>
    </div>
  );
}
