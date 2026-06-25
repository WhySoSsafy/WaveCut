import Link from "next/link";
import type { BeachSummary } from "@/lib/api/aggregate";
import { StatusPill } from "@/components/shared/StatusPill";
import { Stat } from "@/components/shared/Stat";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { Icon } from "@/components/shared/Icon";
import styles from "./web.module.css";

export function FeatureRow({ beach }: { beach: BeachSummary }) {
  return (
    <div className={styles.featRow}>
      <div className={styles.featImg}>
        <div className={styles.featImgGrid} />
        <span className={styles.featImgTag}>{beach.name} 해변 전경</span>
      </div>
      <div className={styles.featInfo}>
        <div className={styles.featTop}>
          <StatusPill status={beach.status} big />
          <span
            className={
              beach.status === "safe" ? styles.famOk : styles.famNo
            }
          >
            <Icon name="sun" size={15} />
            {beach.sky} · {beach.air}℃
          </span>
        </div>
        <h2>{beach.name}</h2>
        <p>
          가족 단위 물놀이에 적합한 대표 해수욕장입니다.
        </p>
        <div className={styles.featStats}>
          <Stat
            icon="sun"
            label="날씨"
            value={beach.sky}
            unit={" · " + beach.air + "℃"}
          />
          <Stat
            icon="uv"
            label="자외선"
            value={beach.uv}
            status={beach.uv === "높음" ? "caution" : "safe"}
          />
          <Stat
            icon="crowd"
            label="예상 혼잡도"
            value={beach.crowd}
            status={beach.crowd === "많음" ? "caution" : "safe"}
          />
          <Stat
            icon="pin"
            label="지역"
            value={beach.region}
          />
        </div>
        <Link href={`/beach/${beach.id}`} className={styles.btnPrimary}>
          상세 보기
          <Icon name="chevron" size={14} color="#fff" />
        </Link>
      </div>
      <ScoreGauge score={beach.score} status={beach.status} size={120} />
    </div>
  );
}
