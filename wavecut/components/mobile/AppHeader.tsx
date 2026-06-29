import { WaveLogo } from "@/components/shared/WaveLogo";
import { WaveWordmark } from "@/components/shared/WaveWordmark";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import styles from "./mobile.module.css";

export function AppHeader() {
  return (
    <header className={styles.appHeader}>
      <WaveLogo size={30} radius={9} />
      <WaveWordmark size="sm" />
      <span style={{ marginLeft: "auto" }}>
        <LanguageSwitcher />
      </span>
    </header>
  );
}
