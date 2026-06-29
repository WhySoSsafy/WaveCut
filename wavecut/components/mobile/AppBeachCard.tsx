"use client";

import Link from "next/link";
import type { BeachSummary } from "@/lib/api/aggregate";
import type { BeachId } from "@/lib/data/fallback";
import { StatusPill } from "@/components/shared/StatusPill";
import { Icon } from "@/components/shared/Icon";
import { BeachPhoto } from "@/components/shared/BeachPhoto";
import { useT } from "@/lib/i18n/LocaleProvider";
import { tv } from "@/lib/i18n/values";
import { FavoriteButton } from "./FavoriteButton";
import styles from "./mobile.module.css";

export function AppBeachCard({ beach }: { beach: BeachSummary }) {
  const t = useT();
  const name = t.beaches[beach.id as BeachId];
  return (
    <Link href={`/app/beach/${beach.id}`} className={styles.arow}>
      {/* Thumbnail */}
      <span className={styles.arowThumb}>
        <BeachPhoto id={beach.id} alt={name} sizes="44px" />
      </span>

      {/* Main info — easy info only */}
      <div className={styles.arowMain}>
        <div className={styles.arowName}>
          {name}
          <StatusPill status={beach.status} />
        </div>
        <div className={styles.arowMeta}>
          <Icon name="sun" size={12} color="var(--ink-3)" />
          {tv(t, "sky", beach.sky)} {beach.air}℃ · {t.card.uv}{" "}
          {tv(t, "uv", beach.uv)} · {t.mobile.crowdShort}{" "}
          {tv(t, "crowd", beach.crowd)}
        </div>
      </div>

      <FavoriteButton id={beach.id} size={18} />
    </Link>
  );
}
