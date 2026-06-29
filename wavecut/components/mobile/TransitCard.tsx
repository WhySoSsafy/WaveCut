import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import type { TransitData } from "@/lib/data/transit";
import styles from "./mobile.module.css";

interface TransitCardProps {
  id: string;
  beachName: string;
  data: TransitData;
}

export function TransitCard({ id, beachName, data }: TransitCardProps) {
  const { station, exit, accessible } = data;

  return (
    <Link href={`/app/transit/${id}`} className={styles.aTransitCard}>
      {/* Beach name */}
      <div className={styles.aTransitCardName}>
        {beachName}
        <Icon name="chevron" size={15} color="var(--ink-3)" />
      </div>

      {/* Nearest station */}
      <div className={styles.aTransitRow}>
        <span className={styles.aTransitIc}>
          <Icon name="transit" size={16} color="var(--blue-600)" />
        </span>
        <div className={styles.aTransitRowBody}>
          <span className={styles.aTransitRowLabel}>가장 가까운 역</span>
          <span className={styles.aTransitRowValue}>
            {station.name}
            <span className={styles.aTransitLineBadge}>{station.line}</span>
          </span>
          <span className={styles.aTransitRowSub}>
            도보 {station.walkMin}분
            {station.note ? ` · ${station.note}` : ""}
          </span>
        </div>
      </div>

      {/* 역 → 해변 이동 애니메이션 */}
      <div className={styles.aTransitTrack} aria-hidden="true">
        <span className={styles.aTransitTrackEnd}>역</span>
        <span className={styles.aTransitRail}>
          <span className={styles.aTransitVehicle}>
            <Icon name="transit" size={11} color="#fff" />
          </span>
        </span>
        <span className={styles.aTransitTrackEnd}>해변</span>
      </div>

      <div className={styles.aTransitDivider} />

      {/* Recommended exit */}
      <div className={styles.aTransitRow}>
        <span className={styles.aTransitIc}>
          <Icon name="pin" size={16} color="var(--blue-600)" />
        </span>
        <div className={styles.aTransitRowBody}>
          <span className={styles.aTransitRowLabel}>추천 출구</span>
          <span className={styles.aTransitRowValue}>{exit.no} 출구</span>
          <span className={styles.aTransitRowSub}>{exit.toward}</span>
        </div>
      </div>

      <div className={styles.aTransitDivider} />

      {/* Accessibility */}
      <div className={styles.aTransitRow}>
        <span className={styles.aTransitIc}>
          <Icon name="family" size={16} color="var(--blue-600)" />
        </span>
        <div className={styles.aTransitRowBody}>
          <span className={styles.aTransitRowLabel}>교통약자 접근성</span>
          {accessible.elevator ? (
            <span className={styles.aTransitAccessBadge}>
              ✅ 엘리베이터 있음
            </span>
          ) : (
            <span className={styles.aTransitAccessBadgeNo}>
              ❌ 엘리베이터 없음
            </span>
          )}
          {accessible.exitNo && (
            <span className={styles.aTransitRowSub}>
              {accessible.exitNo}
            </span>
          )}
          <span className={styles.aTransitRowSub}>{accessible.note}</span>
        </div>
      </div>
    </Link>
  );
}
