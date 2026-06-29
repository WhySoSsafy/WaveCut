"use client";

import Link from "next/link";
import type { BeachSummary } from "@/lib/api/aggregate";
import { Icon } from "@/components/shared/Icon";
import { useT } from "@/lib/i18n/LocaleProvider";
import { AppBeachCard } from "./AppBeachCard";
import { useFavorites } from "./FavoritesProvider";
import styles from "./mobile.module.css";

export function FavoritesList({ beaches }: { beaches: BeachSummary[] }) {
  const m = useT().mobile;
  const { favorites } = useFavorites();
  const favBeaches = beaches.filter((b) => favorites.includes(b.id));

  return (
    <div className={styles.aHomeContent}>
      {/* 페이지 헤더 */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>{m.favLabel}</span>
        <h2>{m.favTitle}</h2>
      </div>

      {favBeaches.length === 0 ? (
        /* 빈 상태 */
        <div className={styles.aFavEmpty}>
          <span className={styles.aFavIc}>
            <Icon name="star" size={26} color="var(--blue-600)" />
          </span>
          <b>{m.favEmptyT}</b>
          <p>{m.favEmptyB}</p>
          <Link href="/app" className={styles.aBtnPrimary}>
            {m.favHome}
            <Icon name="chevron" size={15} color="#fff" />
          </Link>
        </div>
      ) : (
        /* 즐겨찾기 목록 */
        <div>
          <div className={styles.aSecH}>
            {m.favTitle}{" "}
            <span>
              {favBeaches.length}
              {m.beachesUnit}
            </span>
          </div>
          {favBeaches.map((beach) => (
            <AppBeachCard key={beach.id} beach={beach} />
          ))}
        </div>
      )}
    </div>
  );
}
