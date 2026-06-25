import type { SafetyStatus } from "@/lib/bsm/types";
import { Icon, type IconName } from "./Icon";
import { SC, SBG } from "./StatusPill";
import styles from "./shared.module.css";

export function Stat({
  icon,
  label,
  value,
  unit,
  status,
}: {
  icon: IconName;
  label: string;
  value: string | number;
  unit?: string;
  status?: SafetyStatus;
}) {
  return (
    <div className={styles.stat}>
      <span
        className={styles.statIc}
        style={
          status
            ? { background: SBG[status], color: SC[status] }
            : undefined
        }
      >
        <Icon name={icon} size={16} />
      </span>
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>
          {value}
          <em>{unit}</em>
        </div>
      </div>
    </div>
  );
}
