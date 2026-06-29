import Link from "next/link";
import { BeachPhoto } from "@/components/shared/BeachPhoto";
import { getAllSummaries } from "@/lib/api/aggregate";
import { AppBeachCard } from "@/components/mobile/AppBeachCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { Icon } from "@/components/shared/Icon";
import { NearbyBeach } from "@/components/shared/NearbyBeach";
import styles from "@/components/mobile/mobile.module.css";

export default async function AppHomePage() {
  const beaches = await getAllSummaries();
  const rec = beaches[0]; // 해운대 — fixed recommended beach

  return (
    <div className={styles.aHomeContent}>
      {/* 인사 헤더 */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>부산 · 오늘</span>
        <h2>안전한 바다, 지금 확인하세요</h2>
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
            alt={rec.name}
            sizes="(max-width: 480px) 100vw, 430px"
            priority
            className={styles.aRecImgPhoto}
          />
          <span className={styles.aRecFlag}>오늘의 추천</span>
        </div>
        <div className={styles.aRecBody}>
          <div className={styles.aRecTop}>
            <b>{rec.name}</b>
            <StatusPill status={rec.status} />
          </div>
          <div className={styles.aRecStats}>
            <span>
              <Icon name="sun" size={14} color="var(--blue-600)" />
              {rec.sky} {rec.air}℃
            </span>
            <span>
              <Icon name="uv" size={14} color="var(--ink-3)" />
              자외선 {rec.uv}
            </span>
            <span>
              <Icon name="crowd" size={14} color="var(--ink-3)" />
              {rec.crowd}
            </span>
          </div>
        </div>
      </Link>

      {/* 5개 해변 리스트 */}
      <div className={styles.aSecH}>
        주요 해수욕장 <span>{beaches.length}곳</span>
      </div>
      <div>
        {beaches.map((beach) => (
          <AppBeachCard key={beach.id} beach={beach} />
        ))}
      </div>
    </div>
  );
}
