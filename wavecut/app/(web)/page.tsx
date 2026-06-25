import { getAllSummaries } from "@/lib/api/aggregate";
import { BeachCard } from "@/components/shared/BeachCard";
import { HeroCard } from "@/components/web/HeroCard";
import { FeatureRow } from "@/components/web/FeatureRow";
import styles from "@/components/web/web.module.css";

export default async function Dashboard() {
  const beaches = await getAllSummaries();
  const counts = {
    safe: beaches.filter((b) => b.status === "safe").length,
    caution: beaches.filter((b) => b.status === "caution").length,
    danger: beaches.filter((b) => b.status === "danger").length,
    total: beaches.length,
  };
  const feature = beaches.find((b) => b.id === "haeundae") ?? beaches[0];

  return (
    <div className={styles.page}>
      <HeroCard counts={counts} />

      <section>
        <div className={styles.secHead}>
          <h3>오늘의 추천 해수욕장</h3>
          <span>가족 단위 이용에 적합한 곳을 우선 추천합니다</span>
        </div>
        <FeatureRow beach={feature} />
      </section>

      <section>
        <div className={styles.secHead}>
          <h3>주요 해수욕장 안전 현황</h3>
          <span>부산 대표 해수욕장 · 카드를 눌러 상세 정보를 확인하세요</span>
        </div>
        <div className={styles.bcardGrid}>
          {beaches.map((b) => (
            <BeachCard
              key={b.id}
              beach={b}
              href={`/beach/${b.id}`}
              feature={b.id === "haeundae"}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
