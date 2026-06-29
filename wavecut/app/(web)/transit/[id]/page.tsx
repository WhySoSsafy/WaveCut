import { notFound } from "next/navigation";
import Link from "next/link";
import { BEACH_IDS, FALLBACK } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";
import { TRANSIT } from "@/lib/data/transit";
import { kakaoMapSearch, naverMapSearch } from "@/lib/data/mapLinks";
import { Icon } from "@/components/shared/Icon";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/web/web.module.css";

export function generateStaticParams() {
  return BEACH_IDS.map((id) => ({ id }));
}

export default async function TransitDetailPage({
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
    <div className={styles.page}>
      <div className={styles.xsecPageHead}>
        <Link href="/transit" className={styles.btnGhost}>
          <Icon name="chevron" size={14} color="var(--ink-2)" />
          {T.title}
        </Link>
        <h1 className={styles.xsecPageTitle}>
          {name} · {T.detailHead}
        </h1>
        <p className={styles.xsecPageSub}>
          {T.nearestStation}, {T.recExit}, {T.access} · {beach.region}
        </p>
      </div>

      <div className={styles.transitDetailGrid}>
        {/* 가장 가까운 역 */}
        <div className={styles.panel}>
          <div className={styles.panelH}>
            <strong>{T.nearestStation}</strong>
            <span className="mono">{T.subway}</span>
          </div>
          <div className={styles.tdBig}>
            {station.name}
            <span className={styles.wtransitBadge}>{station.line}</span>
          </div>
          <div className={styles.tdMeta}>
            <span>
              <Icon name="pin" size={14} color="var(--ink-3)" /> {T.walk}{" "}
              {station.walkMin}
              {T.minUnit}
            </span>
            {station.note && <span>· {station.note}</span>}
            {station.tel && <span>· ☎ {station.tel}</span>}
          </div>
        </div>

        {/* 추천 출구 */}
        <div className={styles.panel}>
          <div className={styles.panelH}>
            <strong>{T.recExit}</strong>
            <span className="mono">{T.toBeach}</span>
          </div>
          <div className={styles.tdBig}>
            {exit.no} {T.exit}
          </div>
          <div className={styles.tdMeta}>
            <span>{exit.toward}</span>
          </div>
        </div>

        {/* 교통약자 접근성 */}
        <div className={styles.panel}>
          <div className={styles.panelH}>
            <strong>{T.access}</strong>
            <span className="mono">{T.subway}</span>
          </div>
          <div className={styles.tdBig}>
            {accessible.elevator ? (
              <span className={styles.wtransitAccessOk}>{T.elevatorYes}</span>
            ) : (
              <span className={styles.wtransitAccessNo}>{T.elevatorNo}</span>
            )}
          </div>
          <div className={styles.tdMeta}>
            {accessible.exitNo && <span>{accessible.exitNo}</span>}
            <span>· {accessible.note}</span>
          </div>
        </div>
      </div>

      {/* 길찾기 */}
      <div className={styles.panel}>
        <div className={styles.panelH}>
          <strong>{T.routeFind}</strong>
          <span className="mono">{T.externalMap}</span>
        </div>
        <div className={styles.tdMapBtns}>
          <a
            href={kakaoMapSearch(query)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            {T.kakao}
            <Icon name="chevron" size={14} color="#fff" />
          </a>
          <a
            href={naverMapSearch(query)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnGhost}
          >
            {T.naver}
          </a>
        </div>
      </div>

      <p className={styles.wtransitNote}>
        <Icon name="alert" size={14} color="var(--caution)" />
        {T.mock}
      </p>
    </div>
  );
}
