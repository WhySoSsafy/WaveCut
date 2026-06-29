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
import { getI18n } from "@/lib/i18n/server";
import { tv } from "@/lib/i18n/values";
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
  const [{ t }, beach] = await Promise.all([
    getI18n(),
    getBeachDetail(id as (typeof BEACH_IDS)[number]),
  ]);
  const name = t.beaches[id as (typeof BEACH_IDS)[number]];
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
          alt={name}
          sizes="(max-width: 1100px) 100vw, 980px"
          priority
        />
        <div className={styles.detailHead}>
          <div className={styles.detailHeadLeft}>
            <div className={styles.dhName}>
              <h1>{name}</h1>
              <StatusPill status={beach.status} big />
            </div>
            <div className={styles.dhMeta}>
              <Icon name="pin" size={14} color="rgba(255,255,255,0.8)" />
              {beach.region} · {t.panel.shoreLen} {beach.length}km ·{" "}
              <Icon name="sun" size={14} color="rgba(255,255,255,0.8)" />
              {tv(t, "sky", beach.sky)} {beach.air}℃ · {t.panel.uvLabel}{" "}
              {tv(t, "uv", beach.uv)} · {t.panel.crowdLabel}{" "}
              {tv(t, "crowd", beach.crowd)}
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
              <strong>{t.panel.detailXsec}</strong>
              <a href={`/beach/${id}/xsec`} className={styles.panelLink}>
                {t.panel.fullscreen}{" "}
                <Icon name="chevron" size={13} color="var(--blue-600)" />
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
