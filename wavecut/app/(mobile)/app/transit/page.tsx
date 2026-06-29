import { TransitCard } from "@/components/mobile/TransitCard";
import { TRANSIT } from "@/lib/data/transit";
import { BEACH_IDS } from "@/lib/data/fallback";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/mobile/mobile.module.css";

export default async function TransitPage() {
  const { t } = await getI18n();
  return (
    <div className={styles.aTransitContent}>
      {/* Page header */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>{t.transit.subtitle}</span>
        <h2>{t.transit.title}</h2>
      </div>

      {/* Mock data notice */}
      <p className={styles.aTransitMockNote}>※ {t.transit.mock}</p>

      {/* Transit cards for all beaches */}
      <div>
        {BEACH_IDS.map((id) => (
          <TransitCard
            key={id}
            id={id}
            beachName={t.beaches[id]}
            data={TRANSIT[id]}
          />
        ))}
      </div>
    </div>
  );
}
