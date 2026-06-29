"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, IconName } from "@/components/shared/Icon";
import styles from "./web.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { label: "메인 대시보드", href: "/",                       icon: "grid",    exact: true },
  { label: "단면 수심 뷰",   href: "/beach/haeundae/xsec",   icon: "layers"  },
  { label: "운영자 대시보드", href: "/operator",               icon: "users"   },
  { label: "교통·접근성",    href: "/transit",                icon: "transit" },
];

export function Sidebar() {
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
          {item.label}
        </Link>
      ))}
      <div className={styles.sideNote}>
        <div className={styles.sideNoteH}>
          <Icon name="alert" size={14} color="var(--caution)" />
          예측 정보 안내
        </div>
        본 정보는 공공데이터 기반 추정값입니다. 입수 전 현장 안전요원의 안내를 따르세요.
      </div>
    </aside>
  );
}
