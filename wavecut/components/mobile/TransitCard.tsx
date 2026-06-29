"use client";

import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import type { TransitData } from "@/lib/data/transit";
import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./mobile.module.css";

interface TransitCardProps {
  id: string;
  beachName: string;
  data: TransitData;
}

export function TransitCard({ id, beachName, data }: TransitCardProps) {
  const T = useT().transit;
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
          <span className={styles.aTransitRowLabel}>{T.nearestStation}</span>
          <span className={styles.aTransitRowValue}>
            {station.name}
            <span className={styles.aTransitLineBadge}>{station.line}</span>
          </span>
          <span className={styles.aTransitRowSub}>
            {T.walk} {station.walkMin}
            {T.minUnit}
            {station.note ? ` · ${station.note}` : ""}
          </span>
        </div>
      </div>

      {/* 역 → 해변 이동 애니메이션 */}
      <div className={styles.aTransitTrack} aria-hidden="true">
        <span className={styles.aTransitTrackEnd}>{T.toStation}</span>
        <span className={styles.aTransitRail}>
          <span className={styles.aTransitVehicle}>
            <Icon name="transit" size={11} color="#fff" />
          </span>
        </span>
        <span className={styles.aTransitTrackEnd}>{T.toBeach}</span>
      </div>

      <div className={styles.aTransitDivider} />

      {/* Recommended exit */}
      <div className={styles.aTransitRow}>
        <span className={styles.aTransitIc}>
          <Icon name="pin" size={16} color="var(--blue-600)" />
        </span>
        <div className={styles.aTransitRowBody}>
          <span className={styles.aTransitRowLabel}>{T.recExit}</span>
          <span className={styles.aTransitRowValue}>
            {exit.no} {T.exit}
          </span>
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
          <span className={styles.aTransitRowLabel}>{T.access}</span>
          {accessible.elevator ? (
            <span className={styles.aTransitAccessBadge}>{T.elevatorYes}</span>
          ) : (
            <span className={styles.aTransitAccessBadgeNo}>{T.elevatorNo}</span>
          )}
          {accessible.exitNo && (
            <span className={styles.aTransitRowSub}>{accessible.exitNo}</span>
          )}
          <span className={styles.aTransitRowSub}>{accessible.note}</span>
        </div>
      </div>
    </Link>
  );
}
