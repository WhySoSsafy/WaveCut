import { notFound } from "next/navigation";
import Link from "next/link";
import { getBeachDetail } from "@/lib/api/aggregate";
import { BeachPhoto } from "@/components/shared/BeachPhoto";
import { CrossSection } from "@/components/shared/CrossSection";
import { BEACH_IDS } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";
import { StatusPill } from "@/components/shared/StatusPill";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { Icon } from "@/components/shared/Icon";
import { AppOceanPanel } from "@/components/mobile/AppOceanPanel";
import { FavoriteButton } from "@/components/mobile/FavoriteButton";
import { WaveDivider } from "@/components/shared/WaveDivider";
import { getI18n } from "@/lib/i18n/server";
import { tv } from "@/lib/i18n/values";
import styles from "@/components/mobile/mobile.module.css";

export function generateStaticParams() {
  return BEACH_IDS.map((id) => ({ id }));
}

export default async function AppBeachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!BEACH_IDS.includes(id as BeachId)) notFound();
  const [{ t }, beach] = await Promise.all([
    getI18n(),
    getBeachDetail(id as BeachId),
  ]);
  const name = t.beaches[id as BeachId];

  return (
    <div className={styles.aDetailContent}>
      {/* 뒤로가기 앱바 */}
      <div className={styles.aBar}>
        <Link href="/app" className={styles.aBarBack} aria-label={t.mobile.back}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M11 4l-5 5 5 5"
              stroke="var(--navy-900)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <span className={styles.aBarTitle}>{name}</span>
        <FavoriteButton id={id} size={22} />
      </div>

      {/* Hero strip with status + score */}
      <div className={styles.aDetailHero}>
        <BeachPhoto
          id={id}
          alt={name}
          sizes="(max-width: 480px) 100vw, 430px"
          priority
          className={styles.aDetailHeroImg}
        />
        <div className={styles.aDetailHeroB}>
          <StatusPill status={beach.status} big />
          <ScoreGauge score={beach.score} status={beach.status} size={72} />
        </div>
        <WaveDivider z={1} height={26} color="rgba(255, 255, 255, 0.22)" />
      </div>

      {/* 쉬운 정보 3칸 — 날씨, 자외선, 혼잡도 */}
      <div className={styles.aEasyRow}>
        <div className={styles.aEasy}>
          <Icon name="sun" size={16} color="var(--blue-600)" />
          <span className={styles.aEasyLabel}>{t.card.weather}</span>
          <span className={styles.aEasyValue}>{tv(t, "sky", beach.sky)} {beach.air}℃</span>
        </div>
        <div className={styles.aEasy}>
          <Icon
            name="uv"
            size={16}
            color={beach.uv === "높음" ? "var(--caution)" : "var(--ink-3)"}
          />
          <span className={styles.aEasyLabel}>{t.card.uv}</span>
          <span className={styles.aEasyValue}>{tv(t, "uv", beach.uv)}</span>
        </div>
        <div className={styles.aEasy}>
          <Icon
            name="crowd"
            size={16}
            color={beach.crowd === "많음" ? "var(--caution)" : "var(--ink-3)"}
          />
          <span className={styles.aEasyLabel}>{t.mobile.crowdShort}</span>
          <span className={styles.aEasyValue}>{tv(t, "crowd", beach.crowd)}</span>
        </div>
      </div>

      {/* 근처 주차장 보기 버튼 */}
      <a href="#" className={styles.aParkBtn} aria-label={t.panel.parkingBtn}>
        <span className={styles.aParkIc}>
          <Icon name="car" size={16} color="var(--blue-600)" />
        </span>
        <span className={styles.aParkTxt}>
          <b>{t.panel.parkingBtn}</b>
          <em>{beach.parking} · {beach.parkDist}</em>
        </span>
        <Icon name="chevron" size={15} color="var(--ink-3)" />
      </a>

      {/* 해양 안전 분석 — 전문 지표 (AppOceanPanel) */}
      <div className={styles.aDetailSecH}>{t.panel.oceanTitle}</div>
      <AppOceanPanel
        wave={beach.wave}
        tide={beach.tide}
        tideTrend={beach.tideTrend}
        rip={beach.rip}
        family={beach.family}
      />

      {/* 단면 수심 뷰 — 메인 기능을 바로 임베드 */}
      <div className={styles.aDetailSecH}>
        {t.panel.detailXsec}
        <Link href={`/app/beach/${id}/xsec`} className={styles.aSecLink}>
          {t.panel.fullscreen}{" "}
          <Icon name="chevron" size={13} color="var(--blue-600)" />
        </Link>
      </div>
      <div className={styles.aXsecEmbed}>
        <CrossSection beach={beach} compact />
      </div>
    </div>
  );
}
