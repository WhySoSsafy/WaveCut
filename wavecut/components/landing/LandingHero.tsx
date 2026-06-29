import Link from "next/link";
import Image from "next/image";
import { beachPhotoSrc } from "@/lib/data/beachPhoto";
import { CrossSection } from "@/components/shared/CrossSection";
import { MascotGaze } from "./MascotGaze";
import type { BeachDetail } from "@/lib/api/aggregate";
import type { Dict } from "@/lib/i18n/dictionaries";
import styles from "./landing.module.css";

/**
 * Landing hero: the real interactive 단면 수심 뷰 (drag the transect, watch the
 * vertical depth profile) front-and-center, over a softly blurred Busan beach,
 * with a cursor-tracking life-ring mascot.
 */
export function LandingHero({ beach, t }: { beach: BeachDetail; t: Dict }) {
  const L = t.landing;
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
          <span className={styles.kicker}>{L.kicker}</span>
          <h1 className={styles.title}>
            {L.titleA}
            <br />
            {L.titleB} <span className={styles.titleHi}>{L.titleHi}</span>
          </h1>
          <p className={styles.lede}>{L.lede}</p>
          <div className={styles.ctaRow}>
            <Link href="/dashboard" className={styles.ctaPrimary}>
              {t.common.enter}
              <span aria-hidden="true">→</span>
            </Link>
            <a href="#features" className={styles.ctaGhost}>
              {L.ctaGhost}
            </a>
          </div>
        </div>

        <div className={styles.heroScene}>
          <div className={styles.sceneTag}>
            {t.beaches.haeundae} · {L.sceneTag}
          </div>
          <CrossSection beach={beach} compact showAI={false} />
        </div>
      </div>
    </section>
  );
}
