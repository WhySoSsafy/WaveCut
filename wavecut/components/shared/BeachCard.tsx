import Link from "next/link";
import Image from "next/image";
import type { BeachSummary } from "@/lib/api/aggregate";
import { beachPhotoSrc } from "@/lib/data/beachPhoto";
import { StatusPill } from "./StatusPill";
import { Stat } from "./Stat";
import { ScoreGauge } from "./ScoreGauge";
import { Icon } from "./Icon";
import styles from "./shared.module.css";

export function BeachCard({
  beach,
  href,
  feature,
}: {
  beach: BeachSummary;
  href: string;
  feature?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${styles.bcard}${feature ? ` ${styles.bcardFeat}` : ""}`}
    >
      {feature && (
        <span className={styles.bcardFlag}>MVP 대표</span>
      )}
      <div className={styles.bcardImg}>
        <Image
          src={beachPhotoSrc(beach.id)}
          alt={`${beach.name} 해변 전경`}
          fill
          sizes="(max-width: 900px) 100vw, 380px"
          style={{ objectFit: "cover" }}
        />
        <div className={styles.bcardStatus}>
          <StatusPill status={beach.status} />
        </div>
      </div>
      <div className={styles.bcardBody}>
        <div className={styles.bcardTop}>
          <div>
            <div className={styles.bcardName}>{beach.name}</div>
            <div className={styles.bcardRegion}>
              <Icon name="pin" size={13} color="var(--ink-3)" />
              {beach.region}
            </div>
          </div>
          <ScoreGauge score={beach.score} status={beach.status} size={72} />
        </div>
        <div className={styles.bcardStats}>
          <div className={styles.bcardStat}>
            <Stat
              icon="sun"
              label="날씨"
              value={beach.sky}
              unit={" · " + beach.air + "℃"}
            />
          </div>
          <div className={styles.bcardStat}>
            <Stat
              icon="uv"
              label="자외선"
              value={beach.uv}
              status={beach.uv === "높음" ? "caution" : "safe"}
            />
          </div>
          <div className={styles.bcardStat}>
            <Stat
              icon="crowd"
              label="예상 혼잡도"
              value={beach.crowd}
              status={beach.crowd === "많음" ? "caution" : "safe"}
            />
          </div>
        </div>
        <div className={styles.bcardFoot}>
          <StatusPill status={beach.status} />
          <span className={styles.bcardCta}>
            상세 보기
            <Icon name="chevron" size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
