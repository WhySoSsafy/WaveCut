import { Icon } from "@/components/shared/Icon";
import styles from "./web.module.css";

interface ParkingPanelProps {
  parking: string;
  parkDist: string;
}

export function ParkingPanel({ parking, parkDist }: ParkingPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>주차 안내</strong>
        <span className="mono">현장 이용 정보</span>
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
        <button className={`${styles.btnGhost} ${styles.btnSm}`}>근처 주차장 보기</button>
        <button className={`${styles.btnGhost} ${styles.btnSm}`}>지도에서 확인</button>
      </div>
    </div>
  );
}
