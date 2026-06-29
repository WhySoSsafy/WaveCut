import Link from "next/link";
import { BeachPhoto } from "@/components/shared/BeachPhoto";
import type { BeachSummary } from "@/lib/api/aggregate";
import type { BeachId } from "@/lib/data/fallback";
import { StatusPill } from "@/components/shared/StatusPill";
import { Stat } from "@/components/shared/Stat";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { Icon } from "@/components/shared/Icon";
import type { Dict } from "@/lib/i18n/dictionaries";
import { tv } from "@/lib/i18n/values";
import styles from "./web.module.css";

export function FeatureRow({ beach, t }: { beach: BeachSummary; t: Dict }) {
  return (
    <Link href={`/beach/${beach.id}`} className={styles.featRow}>
      <div className={styles.featImg}>
        <BeachPhoto
          id={beach.id}
          alt={t.beaches[beach.id as BeachId]}
          sizes="280px"
        />
      </div>
      <div className={styles.featInfo}>
        <div className={styles.featTop}>
          <StatusPill status={beach.status} big />
          <span
            className={beach.status === "safe" ? styles.famOk : styles.famNo}
          >
            <Icon name="sun" size={15} />
            {tv(t, "sky", beach.sky)} · {beach.air}℃
          </span>
        </div>
        <h2>{t.beaches[beach.id as BeachId]}</h2>
        <p>{t.dash.featDesc}</p>
        <div className={styles.featStats}>
          <Stat
            icon="sun"
            label={t.card.weather}
            value={tv(t, "sky", beach.sky)}
            unit={" · " + beach.air + "℃"}
          />
          <Stat
            icon="uv"
            label={t.card.uv}
            value={tv(t, "uv", beach.uv)}
            status={beach.uv === "높음" ? "caution" : "safe"}
          />
          <Stat
            icon="crowd"
            label={t.card.crowd}
            value={tv(t, "crowd", beach.crowd)}
            status={beach.crowd === "많음" ? "caution" : "safe"}
          />
          <Stat icon="pin" label={t.card.region} value={beach.region} />
        </div>
        <span className={styles.btnPrimary}>
          {t.card.detail}
          <Icon name="chevron" size={14} color="#fff" />
        </span>
      </div>
      <ScoreGauge score={beach.score} status={beach.status} size={120} />
    </Link>
  );
}
