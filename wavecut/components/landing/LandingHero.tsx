import Link from "next/link";
import Image from "next/image";
import { beachPhotoSrc } from "@/lib/data/beachPhoto";
import { CrossSection } from "@/components/shared/CrossSection";
import { MascotGaze } from "./MascotGaze";
import type { BeachDetail } from "@/lib/api/aggregate";
import styles from "./landing.module.css";

/**
 * Landing hero: the real interactive 단면 수심 뷰 (drag the transect, watch the
 * vertical depth profile) front-and-center, over a softly blurred Busan beach,
 * with a cursor-tracking life-ring mascot.
 */
export function LandingHero({ beach }: { beach: BeachDetail }) {
  return (
    <section className={styles.hero}>
      <Image
        src={beachPhotoSrc("haeundae")}
        alt=""
        fill
        priority
        sizes="100vw"
        className={styles.heroBg}
      />
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <MascotGaze size={116} />
          <span className={styles.kicker}>부산 해수욕장 안전 서비스</span>
          <h1 className={styles.title}>
            우리 가족 바다,
            <br />
            지금 <span className={styles.titleHi}>안전한가요?</span>
          </h1>
          <p className={styles.lede}>
            수심을 숫자가 아닌 <b>발목·무릎·허리·가슴</b> 체감 단계로. 실시간
            공공데이터로 부산 해변의 안전을 한눈에 확인하세요.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/dashboard" className={styles.ctaPrimary}>
              서비스 들어가기
              <span aria-hidden="true">→</span>
            </Link>
            <a href="#features" className={styles.ctaGhost}>
              기능 살펴보기 ↓
            </a>
          </div>
        </div>

        <div className={styles.heroScene}>
          <div className={styles.sceneTag}>
            {beach.name} · 단면 수심 뷰 — 단면선을 직접 드래그해 보세요
          </div>
          <CrossSection beach={beach} compact showAI={false} />
        </div>
      </div>
    </section>
  );
}
