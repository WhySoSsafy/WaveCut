import { WebTransitCard } from "@/components/web/WebTransitCard";
import { TRANSIT } from "@/lib/data/transit";
import { BEACH_IDS } from "@/lib/data/fallback";
import { Icon } from "@/components/shared/Icon";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/web/web.module.css";

export default async function TransitPage() {
  const { t } = await getI18n();
  return (
    <div className={styles.page}>
      <section>
        <div className={styles.secHead}>
          <h3>{t.transit.title}</h3>
          <span>{t.transit.subtitle}</span>
        </div>

        <p className={styles.wtransitNote}>
          <Icon name="alert" size={14} color="var(--caution)" />
          {t.transit.mock}
        </p>

        <div className={styles.wtransitGrid}>
          {BEACH_IDS.map((id) => (
            <WebTransitCard
              key={id}
              id={id}
              beachName={t.beaches[id]}
              data={TRANSIT[id]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
