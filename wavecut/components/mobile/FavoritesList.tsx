"use client";

import Link from "next/link";
import type { BeachSummary } from "@/lib/api/aggregate";
import { Icon } from "@/components/shared/Icon";
import { AppBeachCard } from "./AppBeachCard";
import { useFavorites } from "./FavoritesProvider";
import styles from "./mobile.module.css";

export function FavoritesList({ beaches }: { beaches: BeachSummary[] }) {
  const { favorites } = useFavorites();
  const favBeaches = beaches.filter((b) => favorites.includes(b.id));

  return (
    <div className={styles.aHomeContent}>
      {/* 페이지 헤더 */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>자주 찾는 해수욕장</span>
        <h2>즐겨찾기</h2>
      </div>

      {favBeaches.length === 0 ? (
        /* 빈 상태 */
        <div className={styles.aFavEmpty}>
          <span className={styles.aFavIc}>
            <Icon name="star" size={26} color="var(--blue-600)" />
          </span>
          <b>아직 즐겨찾기한 해수욕장이 없습니다</b>
          <p>
            자주 방문하는 해수욕장을 저장하면
            <br />
            안전 정보를 더 빠르게 확인할 수 있어요.
          </p>
          <Link href="/app" className={styles.aBtnPrimary}>
            홈에서 해수욕장 보기
            <Icon name="chevron" size={15} color="#fff" />
          </Link>
        </div>
      ) : (
        /* 즐겨찾기 목록 */
        <div>
          <div className={styles.aSecH}>
            즐겨찾기 <span>{favBeaches.length}곳</span>
          </div>
          {favBeaches.map((beach) => (
            <AppBeachCard key={beach.id} beach={beach} />
          ))}
        </div>
      )}
    </div>
  );
}
