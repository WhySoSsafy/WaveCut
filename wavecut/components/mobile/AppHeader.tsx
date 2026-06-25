import { WaveLogo } from "@/components/shared/WaveLogo";
import { WaveWordmark } from "@/components/shared/WaveWordmark";
import styles from "./mobile.module.css";

export function AppHeader() {
  return (
    <header className={styles.appHeader}>
      <WaveLogo size={30} radius={9} />
      <WaveWordmark size="sm" />
    </header>
  );
}
