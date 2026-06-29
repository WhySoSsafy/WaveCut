import { WebTransitCard } from "@/components/web/WebTransitCard";
import { TRANSIT } from "@/lib/data/transit";
import { BEACH_IDS, FALLBACK } from "@/lib/data/fallback";
import { Icon } from "@/components/shared/Icon";
import styles from "@/components/web/web.module.css";

export default function TransitPage() {
  return (
    <div className={styles.page}>
      <section>
        <div className={styles.secHead}>
          <h3>교통·접근성</h3>
          <span>지하철·교통약자 안내 — 부산 주요 해수욕장</span>
        </div>

        <p className={styles.wtransitNote}>
          <Icon name="alert" size={14} color="var(--caution)" />
          목업 데이터입니다. 부산교통공사 공공데이터 API 연동 예정이며,
          역세권·엘리베이터 정보는 실제와 다를 수 있습니다.
        </p>

        <div className={styles.wtransitGrid}>
          {BEACH_IDS.map((id) => (
            <WebTransitCard
              key={id}
              id={id}
              beachName={FALLBACK[id].name}
              data={TRANSIT[id]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
