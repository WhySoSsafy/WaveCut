"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/shared/Icon";
import styles from "./mobile.module.css";

interface TabItem {
  label: string;
  href: string;
  icon: "grid" | "star" | "user" | "transit";
  exact?: boolean;
}

const TABS: TabItem[] = [
  { label: "홈",       href: "/app",           icon: "grid",    exact: true },
  { label: "즐겨찾기", href: "/app/favorites",  icon: "star" },
  { label: "교통",     href: "/app/transit",    icon: "transit" },
  { label: "마이페이지", href: "/app/mypage",   icon: "user" },
];

export function BottomTabBar() {
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
            <span className={styles.tabLabel}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
