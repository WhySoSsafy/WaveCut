import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import type { TransitData } from "@/lib/data/transit";
import styles from "./web.module.css";

interface WebTransitCardProps {
  id: string;
  beachName: string;
  data: TransitData;
}

export function WebTransitCard({ id, beachName, data }: WebTransitCardProps) {
  const { station, exit, accessible } = data;

  return (
    <Link href={`/transit/${id}`} className={styles.wtransitCard}>
      <div className={styles.wtransitName}>
        {beachName}
        <span className={styles.wtransitMore}>
          상세 <Icon name="chevron" size={13} color="var(--blue-600)" />
        </span>
      </div>

      {/* 가장 가까운 역 */}
      <div className={styles.wtransitRow}>
        <span className={styles.wtransitIc}>
          <Icon name="transit" size={16} color="var(--blue-600)" />
        </span>
        <div className={styles.wtransitBody}>
          <span className={styles.wtransitLabel}>가장 가까운 역</span>
          <span className={styles.wtransitValue}>
            {station.name}
            <span className={styles.wtransitBadge}>{station.line}</span>
          </span>
          <span className={styles.wtransitSub}>
            도보 {station.walkMin}분{station.note ? ` · ${station.note}` : ""}
          </span>
        </div>
      </div>

      {/* 역 → 해변 이동 애니메이션 */}
      <div className={styles.wtransitTrack} aria-hidden="true">
        <span className={styles.wtransitTrackEnd}>역</span>
        <span className={styles.wtransitRail}>
          <span className={styles.wtransitVehicle}>
            <Icon name="transit" size={11} color="#fff" />
          </span>
        </span>
        <span className={styles.wtransitTrackEnd}>해변</span>
      </div>

      <div className={styles.wtransitDivider} />

      {/* 추천 출구 */}
      <div className={styles.wtransitRow}>
        <span className={styles.wtransitIc}>
          <Icon name="pin" size={16} color="var(--blue-600)" />
        </span>
        <div className={styles.wtransitBody}>
          <span className={styles.wtransitLabel}>추천 출구</span>
          <span className={styles.wtransitValue}>{exit.no} 출구</span>
          <span className={styles.wtransitSub}>{exit.toward}</span>
        </div>
      </div>

      <div className={styles.wtransitDivider} />

      {/* 교통약자 접근성 */}
      <div className={styles.wtransitRow}>
        <span className={styles.wtransitIc}>
          <Icon name="family" size={16} color="var(--blue-600)" />
        </span>
        <div className={styles.wtransitBody}>
          <span className={styles.wtransitLabel}>교통약자 접근성</span>
          {accessible.elevator ? (
            <span className={styles.wtransitAccessOk}>✅ 엘리베이터 있음</span>
          ) : (
            <span className={styles.wtransitAccessNo}>❌ 엘리베이터 없음</span>
          )}
          {accessible.exitNo && (
            <span className={styles.wtransitSub}>{accessible.exitNo}</span>
          )}
          <span className={styles.wtransitSub}>{accessible.note}</span>
        </div>
      </div>
    </Link>
  );
}
