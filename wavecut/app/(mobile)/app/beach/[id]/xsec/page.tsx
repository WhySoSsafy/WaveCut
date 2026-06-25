import { notFound } from "next/navigation";
import Link from "next/link";
import { getBeachDetail } from "@/lib/api/aggregate";
import { BEACH_IDS } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";
import { analyze, profileFromTransect, transectAt } from "@/lib/bsm/profile";
import { situationTips } from "@/lib/bsm/aiComment";
import { CrossSection } from "@/components/shared/CrossSection";
import { Icon } from "@/components/shared/Icon";
import { SC, SBG } from "@/components/shared/StatusPill";
import type { IconName } from "@/components/shared/Icon";
import styles from "@/components/mobile/mobile.module.css";

export function generateStaticParams() {
  return BEACH_IDS.map((id) => ({ id }));
}

export default async function AppXSecPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!BEACH_IDS.includes(id as BeachId)) notFound();
  const beach = await getBeachDetail(id as BeachId);

  // Same pipeline as web xsec page (app/(web)/beach/[id]/xsec/page.tsx)
  const a = analyze(
    profileFromTransect(transectAt(beach.transects, 0.5)),
    beach.tideOffsets.now
  );
  const tips = situationTips(a, { family: beach.family, crowd: beach.crowd });

  return (
    <div className={styles.aXsecContent}>
      {/* 뒤로가기 앱바 */}
      <div className={styles.aBar}>
        <Link
          href={`/app/beach/${id}`}
          className={styles.aBarBack}
          aria-label="상세 페이지로 돌아가기"
        >
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
        <span className={styles.aBarTitle}>{beach.name} · 단면 수심 뷰</span>
      </div>

      {/* CrossSection — compact 모드로 높이 절약 */}
      <div className={styles.aXsecPanel}>
        <CrossSection beach={beach} compact />
      </div>

      {/* 상황별 권장 행동 — SituationTips (mobile-adapted single-col layout) */}
      {/* NOTE: web SituationTips uses a 2-col grid that is cramped at 390px;
          we inline the same markup with mobile single-column CSS classes */}
      <div className={styles.aSituationWrap}>
        <div className={styles.aSituationH}>상황별 권장 행동</div>
        <div className={styles.aSitGrid}>
          {tips.map((t) => (
            <div
              key={t.key}
              className={styles.aSitCard}
              style={{ borderColor: SC[t.status] + "33" }}
            >
              <span
                className={styles.aSitIc}
                style={{ background: SBG[t.status], color: SC[t.status] }}
              >
                <Icon name={t.icon as IconName} size={16} />
              </span>
              <b style={{ color: SC[t.status] }}>{t.title}</b>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
