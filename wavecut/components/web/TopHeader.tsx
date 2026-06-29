"use client";

import { WaveLogo } from "@/components/shared/WaveLogo";
import { WaveWordmark } from "@/components/shared/WaveWordmark";
import { Icon } from "@/components/shared/Icon";
import styles from "./web.module.css";

const DATA_SOURCE_TAGS = ["기상청", "국토부", "해수부", "환경부"];

export function TopHeader({ mode = "live" }: { mode?: "live" | "fallback" }) {
  const live = mode === "live";
  return (
    <header className={styles.webHead}>
      <div className={styles.brand}>
        <WaveLogo size={36} radius={11} />
        <WaveWordmark size="lg" />
      </div>
      <div className={styles.webSearch}>
        <Icon name="pin" size={15} color="var(--ink-3)" />
        <input placeholder="부산 해수욕장 검색" defaultValue="" />
      </div>
      <div className={styles.webHeadRight}>
        <span className={styles.updated}>
          <i className={`dot ${live ? "bg-safe" : "bg-caution"}`} />
          {live ? "실시간 · 06:00 갱신" : "추정 데이터 · 데모"}
        </span>
        <span className={styles.srcChips}>
          {DATA_SOURCE_TAGS.map((tag) => (
            <em key={tag} className="mono">{tag}</em>
          ))}
        </span>
      </div>
    </header>
  );
}
