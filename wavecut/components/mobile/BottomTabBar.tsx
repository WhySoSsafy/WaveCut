"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./mobile.module.css";

interface TabItem {
  key: "tabHome" | "tabFav" | "tabTransit" | "tabMy";
  href: string;
  icon: "grid" | "star" | "user" | "transit";
  exact?: boolean;
}

const TABS: TabItem[] = [
  { key: "tabHome",    href: "/app",           icon: "grid",    exact: true },
  { key: "tabFav",     href: "/app/favorites",  icon: "star" },
  { key: "tabTransit", href: "/app/transit",    icon: "transit" },
  { key: "tabMy",      href: "/app/mypage",     icon: "user" },
];

export function BottomTabBar() {
  const m = useT().mobile;
  const pathname = usePathname();

  const isActive = (tab: TabItem): boolean => {
    if (tab.exact) return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(tab.href + "/");
  };

  return (
    <nav className={styles.bottomTabBar}>
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab}${active ? ` ${styles.tabOn}` : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={active ? "var(--blue-600)" : "var(--ink-3)"}
            />
            <span className={styles.tabLabel}>{m[tab.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
