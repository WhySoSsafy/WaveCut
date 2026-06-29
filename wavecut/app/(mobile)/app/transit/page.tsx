import { TransitCard } from "@/components/mobile/TransitCard";
import { TRANSIT } from "@/lib/data/transit";
import { BEACH_IDS, FALLBACK } from "@/lib/data/fallback";
import styles from "@/components/mobile/mobile.module.css";

export default function TransitPage() {
  return (
    <div className={styles.aTransitContent}>
      {/* Page header */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>지하철·교통약자 안내</span>
        <h2>교통·접근성</h2>
      </div>

      {/* Mock data notice */}
      <p className={styles.aTransitMockNote}>
        ※ 목업 데이터 — 부산교통공사 공공데이터 API 연동 예정입니다.
        역세권정보·엘리베이터 정보는 실제와 다를 수 있습니다.
      </p>

      {/* Transit cards for all 5 beaches */}
      <div>
        {BEACH_IDS.map((id) => (
          <TransitCard
            key={id}
            id={id}
            beachName={FALLBACK[id].name}
            data={TRANSIT[id]}
          />
        ))}
      </div>
    </div>
  );
}
