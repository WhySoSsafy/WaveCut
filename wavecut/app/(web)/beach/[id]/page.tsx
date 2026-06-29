import { notFound } from "next/navigation";
import { getBeachDetail } from "@/lib/api/aggregate";
import { BEACH_IDS } from "@/lib/data/fallback";
import { BeachPhoto } from "@/components/shared/BeachPhoto";
import { CrossSection } from "@/components/shared/CrossSection";
import { WaveDivider } from "@/components/shared/WaveDivider";
import { analyze, profileFromTransect, transectAt } from "@/lib/bsm/profile";
import { situationTips } from "@/lib/bsm/aiComment";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { StatusPill } from "@/components/shared/StatusPill";
import { Icon } from "@/components/shared/Icon";
import { OceanSafetyPanel } from "@/components/web/OceanSafetyPanel";
import { ParkingPanel } from "@/components/web/ParkingPanel";
import { TideForecastPanel } from "@/components/web/TideForecastPanel";
import { SituationTips } from "@/components/web/SituationTips";
import { DataSourcePanel } from "@/components/web/DataSourcePanel";
import styles from "@/components/web/web.module.css";

export function generateStaticParams() {
  return BEACH_IDS.map((id) => ({ id }));
}

export default async function BeachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!BEACH_IDS.includes(id as (typeof BEACH_IDS)[number])) notFound();
  const beach = await getBeachDetail(id as (typeof BEACH_IDS)[number]);
  const a = analyze(
    profileFromTransect(transectAt(beach.transects, 0.5)),
    beach.tideOffsets.now
  );
  const tips = situationTips(a, { family: beach.family, crowd: beach.crowd });

  return (
    <div className={styles.page}>
      {/* 히어로 배너: 해변 사진 위에 이름 + 메타 + ScoreGauge */}
      <div className={styles.detailHero}>
        <BeachPhoto
          id={id}
          alt={`${beach.name} 해변 전경`}
          sizes="(max-width: 1100px) 100vw, 980px"
          priority
        />
        <div className={styles.detailHead}>
          <div className={styles.detailHeadLeft}>
            <div className={styles.dhName}>
              <h1>{beach.name}</h1>
              <StatusPill status={beach.status} big />
            </div>
            <div className={styles.dhMeta}>
              <Icon name="pin" size={14} color="rgba(255,255,255,0.8)" />
              {beach.region} · 해안선 길이 {beach.length}km ·{" "}
              <Icon name="sun" size={14} color="rgba(255,255,255,0.8)" />
              {beach.sky} {beach.air}℃ · 자외선 {beach.uv} · 예상 혼잡도{" "}
              {beach.crowd}
            </div>
          </div>
          <div className={styles.dhStats}>
            <ScoreGauge score={beach.score} status={beach.status} size={80} />
          </div>
        </div>
        <WaveDivider z={1} height={28} color="rgba(255, 255, 255, 0.22)" />
      </div>

      {/* 2-컬럼: 메인(단면 수심 뷰 진입 패널 + SituationTips) / 사이드(expert panels) */}
      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          {/* 단면 수심 뷰 — 메인 기능을 바로 임베드 (버튼 뒤에 숨기지 않음) */}
          <div className={styles.panel}>
            <div className={styles.panelH}>
              <strong>단면 수심 뷰</strong>
              <a href={`/beach/${id}/xsec`} className={styles.panelLink}>
                전체 화면 <Icon name="chevron" size={13} color="var(--blue-600)" />
              </a>
            </div>
            <CrossSection beach={beach} />
          </div>
          <SituationTips tips={tips} />
        </div>

        <aside className={styles.detailAside}>
          <OceanSafetyPanel
            wave={beach.wave}
            tide={beach.tide}
            tideTrend={beach.tideTrend}
            rip={beach.rip}
            family={beach.family}
          />
          <ParkingPanel parking={beach.parking} parkDist={beach.parkDist} />
          <TideForecastPanel offsets={beach.tideOffsets} />
          <DataSourcePanel />
        </aside>
      </div>
    </div>
  );
}
