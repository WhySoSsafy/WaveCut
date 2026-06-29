import { getAllSummaries } from "@/lib/api/aggregate";
import { BeachCard } from "@/components/shared/BeachCard";
import { HeroCard } from "@/components/web/HeroCard";
import { FeatureRow } from "@/components/web/FeatureRow";
import { StatusDonut } from "@/components/web/StatusDonut";
import { NearbyBeach } from "@/components/shared/NearbyBeach";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/web/web.module.css";

export default async function Dashboard() {
  const [{ t }, beaches] = await Promise.all([getI18n(), getAllSummaries()]);
  const D = t.dash;
  const counts = {
    safe: beaches.filter((b) => b.status === "safe").length,
    caution: beaches.filter((b) => b.status === "caution").length,
    danger: beaches.filter((b) => b.status === "danger").length,
    total: beaches.length,
  };
  const feature = beaches.find((b) => b.id === "haeundae") ?? beaches[0];

  return (
    <div className={styles.page}>
      <HeroCard counts={counts} t={t} />

      <section>
        <div className={styles.secHead}>
          <h3>{D.distTitle}</h3>
          <span>{D.distSub}</span>
        </div>
        <StatusDonut counts={counts} />
      </section>

      <section>
        <div className={styles.secHead}>
          <h3>{D.nearbyTitle}</h3>
          <span>{D.nearbySub}</span>
        </div>
        <NearbyBeach hrefBase="/beach" />
      </section>

      <section>
        <div className={styles.secHead}>
          <h3>{D.recTitle}</h3>
          <span>{D.recSub}</span>
        </div>
        <FeatureRow beach={feature} t={t} />
      </section>

      <section>
        <div className={styles.secHead}>
          <h3>{D.statusTitle}</h3>
          <span>{D.statusSub}</span>
        </div>
        <div className={styles.bcardGrid}>
          {beaches.map((b) => (
            <BeachCard
              key={b.id}
              beach={b}
              href={`/beach/${b.id}`}
              feature={b.id === "haeundae"}
              t={t}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
