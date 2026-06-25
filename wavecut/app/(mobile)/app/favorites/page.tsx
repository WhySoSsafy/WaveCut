import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import styles from "@/components/mobile/mobile.module.css";

export default function FavoritesPage() {
  return (
    <div className={styles.aHomeContent}>
      {/* 페이지 헤더 */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>자주 찾는 해수욕장</span>
        <h2>즐겨찾기</h2>
      </div>

      {/* 빈 상태 */}
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
    </div>
  );
}
