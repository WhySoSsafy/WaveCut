import { Sidebar } from "@/components/web/Sidebar";
import { TopHeader } from "@/components/web/TopHeader";
import { dataMode } from "@/lib/api/dataMode";
import styles from "@/components/web/web.module.css";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.web}>
      <TopHeader mode={dataMode()} />
      <div className={styles.webBody}>
        <Sidebar />
        <main className={styles.webMain}>{children}</main>
      </div>
    </div>
  );
}
