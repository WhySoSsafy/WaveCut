import Image from "next/image";
import { beachPhotoSrc } from "@/lib/data/beachPhoto";
import styles from "./web.module.css";

interface HeroCounts {
  safe: number;
  caution: number;
  danger: number;
  total: number;
}

export function HeroCard({ counts }: { counts: HeroCounts }) {
  return (
    <div className={styles.pageHero}>
      <Image
        src={beachPhotoSrc("haeundae")}
        alt="해운대 해수욕장"
        fill
        sizes="100vw"
        priority
        className={styles.heroImg}
        style={{ objectFit: "cover" }}
      />
      <div className={styles.heroText}>
        <h1>우리 가족 바다, 오늘 안전한가요?</h1>
        <p>
          실시간 공공데이터를 AI가 분석해 부산 주요 해수욕장의 체감 수심과
          안전 등급을 알려드립니다.
        </p>
      </div>
      <div className={styles.heroSummary}>
        <div className={styles.hsum}>
          <b className={styles.sSafe}>{counts.safe}</b>
          <span>안전</span>
        </div>
        <div className={styles.hsum}>
          <b className={styles.sCaution}>{counts.caution}</b>
          <span>주의</span>
        </div>
        <div className={styles.hsum}>
          <b className={styles.sDanger}>{counts.danger}</b>
          <span>위험</span>
        </div>
        <div className={`${styles.hsum} ${styles.hsumDiv}`}>
          <b>{counts.total}</b>
          <span>모니터링</span>
        </div>
      </div>
    </div>
  );
}
