import Link from "next/link";
import { WaveLogo } from "@/components/shared/WaveLogo";
import { WaveWordmark } from "@/components/shared/WaveWordmark";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/landing/landing.module.css";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = await getI18n();
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.navBrand} aria-label={t.nav.home}>
          <WaveLogo size={34} radius={10} />
          <WaveWordmark size="md" />
        </Link>
        <div className={styles.navRight}>
          <LanguageSwitcher />
          <Link href="/dashboard" className={styles.navCta}>
            {t.common.enter} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
