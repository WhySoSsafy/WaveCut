import Link from "next/link";
import { BeachPhoto } from "./BeachPhoto";
import type { BeachSummary } from "@/lib/api/aggregate";
import type { BeachId } from "@/lib/data/fallback";
import { StatusPill } from "./StatusPill";
import { Stat } from "./Stat";
import { ScoreGauge } from "./ScoreGauge";
import { Icon } from "./Icon";
import type { Dict } from "@/lib/i18n/dictionaries";
import { tv } from "@/lib/i18n/values";
import styles from "./shared.module.css";

export function BeachCard({
  beach,
  href,
  feature,
  t,
}: {
  beach: BeachSummary;
  href: string;
  feature?: boolean;
  t: Dict;
}) {
  const name = t.beaches[beach.id as BeachId];
  return (
    <Link
      href={href}
      className={`${styles.bcard}${feature ? ` ${styles.bcardFeat}` : ""}`}
    >
      {feature && (
        <span className={styles.bcardFlag}>{t.card.mvp}</span>
      )}
      <div className={styles.bcardImg}>
        <BeachPhoto
          id={beach.id}
          alt={name}
          sizes="(max-width: 900px) 100vw, 380px"
        />
        <div className={styles.bcardStatus}>
          <StatusPill status={beach.status} />
        </div>
      </div>
      <div className={styles.bcardBody}>
        <div className={styles.bcardTop}>
          <div>
            <div className={styles.bcardName}>{name}</div>
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
              label={t.card.weather}
              value={tv(t, "sky", beach.sky)}
              unit={" · " + beach.air + "℃"}
            />
          </div>
          <div className={styles.bcardStat}>
            <Stat
              icon="uv"
              label={t.card.uv}
              value={tv(t, "uv", beach.uv)}
              status={beach.uv === "높음" ? "caution" : "safe"}
            />
          </div>
          <div className={styles.bcardStat}>
            <Stat
              icon="crowd"
              label={t.card.crowd}
              value={tv(t, "crowd", beach.crowd)}
              status={beach.crowd === "많음" ? "caution" : "safe"}
            />
          </div>
        </div>
        <div className={styles.bcardFoot}>
          <StatusPill status={beach.status} />
          <span className={styles.bcardCta}>
            {t.card.detail}
            <Icon name="chevron" size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
