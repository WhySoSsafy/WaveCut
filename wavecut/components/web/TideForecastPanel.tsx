import { Icon } from "@/components/shared/Icon";
import styles from "./web.module.css";

interface TideOffsets {
  now: number;
  t1: number;
  t2: number;
}

interface TideForecastPanelProps {
  offsets: TideOffsets;
}

const DEPTH_LABELS = [
  { max: 0.4, label: "발목" },
  { max: 0.7, label: "무릎" },
  { max: 1.1, label: "허리" },
  { max: 1.5, label: "가슴" },
  { max: Infinity, label: "머리 이상" },
];

function depthLabel(offset: number): string {
  const base = 0.8; // approximate mid-beach base depth
  const total = base + offset;
  for (const { max, label } of DEPTH_LABELS) {
    if (total < max) return label;
  }
  return "머리 이상";
}

const COLORS = ["var(--d-knee)", "var(--d-waist)", "var(--d-chest)"];
const MAX = 1.5;

export function TideForecastPanel({ offsets }: TideForecastPanelProps) {
  const rows = [
    { label: "현재", offset: offsets.now, isNow: true },
    { label: "1시간 후", offset: offsets.t1, isNow: false },
    { label: "2시간 후", offset: offsets.t2, isNow: false },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>시간대별 체감 수심</strong>
        <span className="mono">조위 예측</span>
      </div>
      <div className={styles.tideRows}>
        {rows.map((r, i) => {
          const h = +(0.8 + r.offset).toFixed(2);
          const pct = Math.min((h / MAX) * 100, 100);
          return (
            <div key={i} className={`${styles.tideRow}${r.isNow ? " " + styles.tideRowNow : ""}`}>
              <span className={`${styles.tideT} mono`}>{r.label}</span>
              <div className={styles.tideBar}>
                <i style={{ width: pct + "%", background: COLORS[i] ?? COLORS[2] }} />
              </div>
              <span className={styles.tideD}>
                {depthLabel(r.offset)}
                <em className="mono"> {h}m</em>
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.tideNote}>
        <Icon name="tide" size={14} color="var(--blue-600)" />
        오후로 갈수록 조위가 상승해 같은 위치의 체감 수심이 깊어집니다.
      </div>
    </div>
  );
}
