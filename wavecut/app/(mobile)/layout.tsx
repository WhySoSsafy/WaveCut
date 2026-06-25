import { AppHeader } from "@/components/mobile/AppHeader";
import { BottomTabBar } from "@/components/mobile/BottomTabBar";
import { FavoritesProvider } from "@/components/mobile/FavoritesProvider";
import styles from "@/components/mobile/mobile.module.css";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.mobileFrame}>
      <div className={styles.phone}>
        <AppHeader />
        <FavoritesProvider>
          <main className={styles.mobileContent}>{children}</main>
        </FavoritesProvider>
        <BottomTabBar />
      </div>
    </div>
  );
}
