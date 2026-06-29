import { getAllSummaries } from "@/lib/api/aggregate";
import { BeachCard } from "@/components/shared/BeachCard";
import { HeroCard } from "@/components/web/HeroCard";
import { FeatureRow } from "@/components/web/FeatureRow";
import { StatusDonut } from "@/components/web/StatusDonut";
import { NearbyBeach } from "@/components/shared/NearbyBeach";
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
          <h3>오늘의 안전 분포</h3>
          <span>부산 주요 6개 해수욕장 실시간 안전 등급</span>
        </div>
        <StatusDonut counts={counts} />
      </section>

      <section>
        <div className={styles.secHead}>
          <h3>내 주변 해수욕장</h3>
          <span>위치를 허용하면 가까운 순으로 안내합니다</span>
        </div>
        <NearbyBeach hrefBase="/beach" />
      </section>

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
