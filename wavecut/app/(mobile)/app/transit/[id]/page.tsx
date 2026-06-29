import { notFound } from "next/navigation";
import Link from "next/link";
import { BEACH_IDS, FALLBACK } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";
import { TRANSIT } from "@/lib/data/transit";
import { kakaoMapSearch, naverMapSearch } from "@/lib/data/mapLinks";
import { Icon } from "@/components/shared/Icon";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/mobile/mobile.module.css";

export function generateStaticParams() {
  return BEACH_IDS.map((id) => ({ id }));
}

export default async function AppTransitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!BEACH_IDS.includes(id as BeachId)) notFound();
  const { t } = await getI18n();
  const T = t.transit;
  const beach = FALLBACK[id as BeachId];
  const name = t.beaches[id as BeachId];
  const { station, exit, accessible } = TRANSIT[id as BeachId];
  const query = `${beach.name} ${station.name}`;

  return (
    <div className={styles.aTransitContent}>
      {/* 앱바 */}
      <div className={styles.aBar}>
        <Link href="/app/transit" className={styles.aBarBack} aria-label={T.backList}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4l-5 5 5 5" stroke="var(--navy-900)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className={styles.aBarTitle}>
          {name} {T.title}
        </span>
        <span style={{ width: 18 }} />
      </div>

      {/* 가장 가까운 역 */}
      <div className={styles.aTransitCard}>
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
              {station.tel ? ` · ☎ ${station.tel}` : ""}
            </span>
          </div>
        </div>

        <div className={styles.aTransitDivider} />

        {/* 추천 출구 */}
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

        {/* 교통약자 접근성 */}
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
      </div>

      {/* 길찾기 */}
      <a href={kakaoMapSearch(query)} target="_blank" rel="noopener noreferrer" className={styles.aBtnPrimary}>
        {T.kakao}
        <Icon name="chevron" size={15} color="#fff" />
      </a>
      <a
        href={naverMapSearch(query)}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.aParkBtn}
        style={{ marginTop: 10 }}
      >
        <span className={styles.aParkIc}>
          <Icon name="pin" size={16} color="var(--blue-600)" />
        </span>
        <span className={styles.aParkTxt}>
          <b>{T.naver}</b>
          <em>{station.name} {T.around}</em>
        </span>
        <Icon name="chevron" size={15} color="var(--ink-3)" />
      </a>

      <p className={styles.aTransitMockNote}>※ {T.mock}</p>
    </div>
  );
}
