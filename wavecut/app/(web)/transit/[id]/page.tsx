import { notFound } from "next/navigation";
import Link from "next/link";
import { BEACH_IDS, FALLBACK } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";
import { TRANSIT } from "@/lib/data/transit";
import { kakaoMapSearch, naverMapSearch } from "@/lib/data/mapLinks";
import { Icon } from "@/components/shared/Icon";
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
  const beach = FALLBACK[id as BeachId];
  const { station, exit, accessible } = TRANSIT[id as BeachId];
  const query = `${beach.name} ${station.name}`;

  return (
    <div className={styles.page}>
      <div className={styles.xsecPageHead}>
        <Link href="/transit" className={styles.btnGhost}>
          <Icon name="chevron" size={14} color="var(--ink-2)" />
          교통·접근성
        </Link>
        <h1 className={styles.xsecPageTitle}>{beach.name} · 교통·접근성</h1>
        <p className={styles.xsecPageSub}>
          가장 가까운 역, 추천 출구, 교통약자 접근성 안내 · {beach.region}
        </p>
      </div>

      <div className={styles.transitDetailGrid}>
        {/* 가장 가까운 역 */}
        <div className={styles.panel}>
          <div className={styles.panelH}>
            <strong>가장 가까운 역</strong>
            <span className="mono">지하철</span>
          </div>
          <div className={styles.tdBig}>
            {station.name}
            <span className={styles.wtransitBadge}>{station.line}</span>
          </div>
          <div className={styles.tdMeta}>
            <span><Icon name="pin" size={14} color="var(--ink-3)" /> 도보 {station.walkMin}분</span>
            {station.note && <span>· {station.note}</span>}
            {station.tel && <span>· ☎ {station.tel}</span>}
          </div>
        </div>

        {/* 추천 출구 */}
        <div className={styles.panel}>
          <div className={styles.panelH}>
            <strong>추천 출구</strong>
            <span className="mono">해수욕장 방향</span>
          </div>
          <div className={styles.tdBig}>{exit.no} 출구</div>
          <div className={styles.tdMeta}>
            <span>{exit.toward}</span>
          </div>
        </div>

        {/* 교통약자 접근성 */}
        <div className={styles.panel}>
          <div className={styles.panelH}>
            <strong>교통약자 접근성</strong>
            <span className="mono">엘리베이터</span>
          </div>
          <div className={styles.tdBig}>
            {accessible.elevator ? (
              <span className={styles.wtransitAccessOk}>✅ 엘리베이터 있음</span>
            ) : (
              <span className={styles.wtransitAccessNo}>❌ 엘리베이터 없음</span>
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
          <strong>길찾기</strong>
          <span className="mono">외부 지도</span>
        </div>
        <div className={styles.tdMapBtns}>
          <a
            href={kakaoMapSearch(query)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimary}
          >
            카카오맵에서 보기
            <Icon name="chevron" size={14} color="#fff" />
          </a>
          <a
            href={naverMapSearch(query)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnGhost}
          >
            네이버지도에서 보기
          </a>
        </div>
      </div>

      <p className={styles.wtransitNote}>
        <Icon name="alert" size={14} color="var(--caution)" />
        목업 데이터입니다. 부산교통공사 공공데이터 API 연동 예정이며,
        역세권·엘리베이터 정보는 실제와 다를 수 있습니다.
      </p>
    </div>
  );
}
