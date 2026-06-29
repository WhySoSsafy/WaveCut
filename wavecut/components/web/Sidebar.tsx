"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, IconName } from "@/components/shared/Icon";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { Dict } from "@/lib/i18n/dictionaries";
import styles from "./web.module.css";

interface NavItem {
  key: keyof Dict["nav"];
  href: string;
  icon: IconName;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { key: "dashboard", href: "/dashboard",            icon: "grid",    exact: true },
  { key: "xsec",      href: "/beach/haeundae/xsec",  icon: "layers"  },
  { key: "operator",  href: "/operator",             icon: "users"   },
  { key: "transit",   href: "/transit",              icon: "transit" },
];

export function Sidebar() {
  const t = useT();
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside className={styles.webSide}>
      <div className={styles.sideLabel}>MENU</div>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.sideItem}${isActive(item) ? ` ${styles.sideItemOn}` : ""}`}
        >
          <Icon name={item.icon} size={17} />
          {t.nav[item.key]}
        </Link>
      ))}
      <div className={styles.sideNote}>
        <div className={styles.sideNoteH}>
          <Icon name="alert" size={14} color="var(--caution)" />
          {t.nav.noticeH}
        </div>
        {t.nav.noticeBody}
      </div>
    </aside>
  );
}
