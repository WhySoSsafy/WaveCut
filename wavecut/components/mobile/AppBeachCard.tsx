import Link from "next/link";
import Image from "next/image";
import type { BeachSummary } from "@/lib/api/aggregate";
import { StatusPill } from "@/components/shared/StatusPill";
import { Icon } from "@/components/shared/Icon";
import { beachPhotoSrc } from "@/lib/data/beachPhoto";
import { FavoriteButton } from "./FavoriteButton";
import styles from "./mobile.module.css";

export function AppBeachCard({ beach }: { beach: BeachSummary }) {
  return (
    <Link href={`/app/beach/${beach.id}`} className={styles.arow}>
      {/* Thumbnail */}
      <span className={styles.arowThumb}>
        <Image
          src={beachPhotoSrc(beach.id)}
          alt={beach.name}
          fill
          sizes="44px"
          style={{ objectFit: "cover" }}
        />
      </span>

      {/* Main info — easy info only (날씨, 자외선, 혼잡도) */}
      <div className={styles.arowMain}>
        <div className={styles.arowName}>
          {beach.name}
          <StatusPill status={beach.status} />
        </div>
        <div className={styles.arowMeta}>
          <Icon name="sun" size={12} color="var(--ink-3)" />
          {beach.sky} {beach.air}℃ · 자외선 {beach.uv} · 혼잡 {beach.crowd}
        </div>
      </div>

      <FavoriteButton id={beach.id} size={18} />
    </Link>
  );
}
