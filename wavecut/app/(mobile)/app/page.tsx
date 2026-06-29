import Link from "next/link";
import { BeachPhoto } from "@/components/shared/BeachPhoto";
import { getAllSummaries } from "@/lib/api/aggregate";
import { AppBeachCard } from "@/components/mobile/AppBeachCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { Icon } from "@/components/shared/Icon";
import { NearbyBeach } from "@/components/shared/NearbyBeach";
import { getI18n } from "@/lib/i18n/server";
import { tv } from "@/lib/i18n/values";
import styles from "@/components/mobile/mobile.module.css";

export default async function AppHomePage() {
  const [{ t }, beaches] = await Promise.all([getI18n(), getAllSummaries()]);
  const m = t.mobile;
  const rec = beaches[0]; // 해운대 — fixed recommended beach
  const recName = t.beaches[rec.id as keyof typeof t.beaches];

  return (
    <div className={styles.aHomeContent}>
      {/* 인사 헤더 */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>{m.greetLabel}</span>
        <h2>{m.greetTitle}</h2>
      </div>

      {/* 내 위치 기반 가까운 해변 */}
      <div className={styles.aNearby}>
        <NearbyBeach hrefBase="/app/beach" />
      </div>

      {/* 오늘의 추천 카드 — easy info only */}
      <Link href={`/app/beach/${rec.id}`} className={styles.aRec}>
        <div className={styles.aRecImg}>
          <BeachPhoto
            id={rec.id}
            alt={recName}
            sizes="(max-width: 480px) 100vw, 430px"
            priority
            className={styles.aRecImgPhoto}
          />
          <span className={styles.aRecFlag}>{m.recToday}</span>
        </div>
        <div className={styles.aRecBody}>
          <div className={styles.aRecTop}>
            <b>{recName}</b>
            <StatusPill status={rec.status} />
          </div>
          <div className={styles.aRecStats}>
            <span>
              <Icon name="sun" size={14} color="var(--blue-600)" />
              {tv(t, "sky", rec.sky)} {rec.air}℃
            </span>
            <span>
              <Icon name="uv" size={14} color="var(--ink-3)" />
              {t.card.uv} {tv(t, "uv", rec.uv)}
            </span>
            <span>
              <Icon name="crowd" size={14} color="var(--ink-3)" />
              {tv(t, "crowd", rec.crowd)}
            </span>
          </div>
        </div>
      </Link>

      {/* 해변 리스트 */}
      <div className={styles.aSecH}>
        {m.mainBeaches}{" "}
        <span>
          {beaches.length}
          {m.beachesUnit}
        </span>
      </div>
      <div>
        {beaches.map((beach) => (
          <AppBeachCard key={beach.id} beach={beach} />
        ))}
      </div>
    </div>
  );
}
