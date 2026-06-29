import Link from "next/link";
import { WaveLogo } from "@/components/shared/WaveLogo";
import { WaveWordmark } from "@/components/shared/WaveWordmark";
import styles from "@/components/landing/landing.module.css";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.navBrand} aria-label="WaveCut 홈">
          <WaveLogo size={34} radius={10} />
          <WaveWordmark size="md" />
        </Link>
        <Link href="/dashboard" className={styles.navCta}>
          서비스 들어가기 <span aria-hidden="true">→</span>
        </Link>
      </header>
      {children}
    </div>
  );
}
