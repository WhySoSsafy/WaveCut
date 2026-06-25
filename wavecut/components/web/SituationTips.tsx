import type { SituationTip } from "@/lib/bsm/aiComment";
import { Icon } from "@/components/shared/Icon";
import { SC, SBG } from "@/components/shared/StatusPill";
import type { IconName } from "@/components/shared/Icon";
import styles from "./web.module.css";

interface SituationTipsProps {
  tips: SituationTip[];
}

export function SituationTips({ tips }: SituationTipsProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>상황별 권장 행동</strong>
        <span className="mono">AI 안전 가이드</span>
      </div>
      <div className={styles.sitGrid}>
        {tips.map((t) => (
          <div
            key={t.key}
            className={styles.sitCard}
            style={{ borderColor: SC[t.status] + "33" }}
          >
            <span
              className={styles.sitIc}
              style={{ background: SBG[t.status], color: SC[t.status] }}
            >
              <Icon name={t.icon as IconName} size={16} />
            </span>
            <b style={{ color: SC[t.status] }}>{t.title}</b>
            <p>{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
