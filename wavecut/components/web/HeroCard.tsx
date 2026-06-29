import Image from "next/image";
import { beachPhotoSrc } from "@/lib/data/beachPhoto";
import { CountUp } from "@/components/shared/CountUp";
import { WaveDivider } from "@/components/shared/WaveDivider";
import type { Dict } from "@/lib/i18n/dictionaries";
import styles from "./web.module.css";

interface HeroCounts {
  safe: number;
  caution: number;
  danger: number;
  total: number;
}

export function HeroCard({ counts, t }: { counts: HeroCounts; t: Dict }) {
  return (
    <div className={styles.pageHero}>
      <Image
        src={beachPhotoSrc("haeundae")}
        alt={t.beaches.haeundae}
        fill
        sizes="100vw"
        priority
        className={styles.heroImg}
        style={{ objectFit: "cover" }}
      />
      <div className={styles.heroText}>
        <h1>{t.dash.heroTitle}</h1>
        <p>{t.dash.heroLede}</p>
      </div>
      <div className={styles.heroSummary}>
        <div className={styles.hsum}>
          <b className={styles.sSafe}><CountUp value={counts.safe} /></b>
          <span>{t.common.safe}</span>
        </div>
        <div className={styles.hsum}>
          <b className={styles.sCaution}><CountUp value={counts.caution} /></b>
          <span>{t.common.caution}</span>
        </div>
        <div className={styles.hsum}>
          <b className={styles.sDanger}><CountUp value={counts.danger} /></b>
          <span>{t.common.danger}</span>
        </div>
        <div className={`${styles.hsum} ${styles.hsumDiv}`}>
          <b><CountUp value={counts.total} /></b>
          <span>{t.dash.monitoring}</span>
        </div>
      </div>
      <WaveDivider height={40} color="rgba(255, 255, 255, 0.32)" />
    </div>
  );
}
