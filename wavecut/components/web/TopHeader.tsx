"use client";

import Link from "next/link";
import { WaveLogo } from "@/components/shared/WaveLogo";
import { WaveWordmark } from "@/components/shared/WaveWordmark";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./web.module.css";

const DATA_SOURCE_TAGS = ["기상청", "국토부", "해수부", "환경부"];

export function TopHeader({ mode = "live" }: { mode?: "live" | "fallback" }) {
  const t = useT();
  const live = mode === "live";
  return (
    <header className={styles.webHead}>
      <Link href="/" className={styles.brand} aria-label={t.nav.home}>
        <WaveLogo size={36} radius={11} />
        <WaveWordmark size="lg" />
      </Link>
      <div className={styles.webHeadRight}>
        <span className={styles.updated}>
          <i className={`dot ${live ? "bg-safe" : "bg-caution"}`} />
          {live ? t.nav.live : t.nav.demo}
        </span>
        <span className={styles.srcChips}>
          {DATA_SOURCE_TAGS.map((tag) => (
            <em key={tag} className="mono">{tag}</em>
          ))}
        </span>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
