import { notFound } from "next/navigation";
import { getBeachDetail } from "@/lib/api/aggregate";
import { BEACH_IDS } from "@/lib/data/fallback";
import type { BeachId } from "@/lib/data/fallback";
import { analyze, profileFromTransect, transectAt } from "@/lib/bsm/profile";
import { situationTips } from "@/lib/bsm/aiComment";
import { CrossSection } from "@/components/shared/CrossSection";
import { SituationTips } from "@/components/web/SituationTips";
import { Icon } from "@/components/shared/Icon";
import styles from "@/components/web/web.module.css";

export function generateStaticParams() {
  return BEACH_IDS.map((id) => ({ id }));
}

export default async function XSecPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!BEACH_IDS.includes(id as BeachId)) notFound();
  const beach = await getBeachDetail(id as BeachId);
  const a = analyze(
    profileFromTransect(transectAt(beach.transects, 0.5)),
    beach.tideOffsets.now
  );
  const tips = situationTips(a, { family: beach.family, crowd: beach.crowd });

  return (
    <div className={styles.page}>
      {/* 뒤로가기 + 타이틀 */}
      <div className={styles.xsecPageHead}>
        <a href={`/beach/${id}`} className={styles.btnGhost}>
          <Icon name="chevron" size={14} color="var(--ink-2)" />
          {beach.name}
        </a>
        <h1 className={styles.xsecPageTitle}>{beach.name} · 단면 수심 뷰</h1>
        <p className={styles.xsecPageSub}>
          단면선을 드래그하거나 탭해 위치별 체감 수심과 위험 구간을 확인하세요.
        </p>
      </div>

      {/* CrossSection (Client Component) */}
      <div className={styles.panel}>
        <CrossSection beach={beach} />
      </div>

      {/* 하단 상황별 권장 행동 */}
      <SituationTips tips={tips} />
    </div>
  );
}
