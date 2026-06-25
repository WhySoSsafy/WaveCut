import type { SafetyStatus } from "@/lib/bsm/types";
import { SC } from "./StatusPill";
import styles from "./shared.module.css";

export function ScoreGauge({
  score,
  status,
  size = 96,
}: {
  score: number;
  status: SafetyStatus;
  size?: number;
}) {
  const r = size / 2 - 8;
  const c = Math.PI * r;
  const off = c * (1 - score / 100);

  return (
    <div
      className={styles.gauge}
      style={{ width: size, height: size / 2 + 14 }}
    >
      <svg
        width={size}
        height={size / 2 + 14}
        viewBox={`0 0 ${size} ${size / 2 + 14}`}
      >
        <path
          d={`M8 ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M8 ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none"
          stroke={SC[status]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className={styles.gaugeNum} style={{ color: SC[status] }}>
        {score}
        <span>점</span>
      </div>
    </div>
  );
}
