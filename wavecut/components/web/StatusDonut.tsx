"use client";

import { useEffect, useState } from "react";
import { CountUp } from "@/components/shared/CountUp";
import styles from "./web.module.css";

interface Counts {
  safe: number;
  caution: number;
  danger: number;
  total: number;
}

const R = 46;
const C = 2 * Math.PI * R;

/** Animated safety-distribution donut for the dashboard. */
export function StatusDonut({ counts }: { counts: Counts }) {
  const [on, setOn] = useState(false);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = requestAnimationFrame(() => {
      setReduce(r);
      setOn(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const total = counts.total || 1;
  const segs = [
    { key: "safe", value: counts.safe, color: "var(--safe)" },
    { key: "caution", value: counts.caution, color: "var(--caution)" },
    { key: "danger", value: counts.danger, color: "var(--danger)" },
  ];

  let acc = 0;
  return (
    <div className={styles.donutCard}>
      <div className={styles.donutWrap}>
        <svg viewBox="0 0 120 120" className={styles.donutSvg}>
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="var(--line)"
            strokeWidth="13"
          />
          {segs.map((s) => {
            const len = (s.value / total) * C;
            const start = acc;
            acc += len;
            if (s.value === 0) return null;
            return (
              <circle
                key={s.key}
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="13"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                strokeDasharray={
                  on || reduce ? `${Math.max(len - 2, 0)} ${C}` : `0 ${C}`
                }
                strokeDashoffset={-start}
                style={{
                  transition: reduce
                    ? "none"
                    : "stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            );
          })}
        </svg>
        <div className={styles.donutCenter}>
          <b><CountUp value={counts.total} /></b>
          <span>모니터링</span>
        </div>
      </div>
      <div className={styles.donutLegend}>
        <div className={styles.donutLeg}>
          <i style={{ background: "var(--safe)" }} />
          안전 <b><CountUp value={counts.safe} /></b>
        </div>
        <div className={styles.donutLeg}>
          <i style={{ background: "var(--caution)" }} />
          주의 <b><CountUp value={counts.caution} /></b>
        </div>
        <div className={styles.donutLeg}>
          <i style={{ background: "var(--danger)" }} />
          위험 <b><CountUp value={counts.danger} /></b>
        </div>
      </div>
      <div className={styles.donutMsg}>
        {counts.danger > 0 ? (
          <>
            <b className={styles.sDanger}>위험 단계 {counts.danger}곳</b> — 즉시
            현장 확인이 필요합니다.
          </>
        ) : counts.caution > 0 ? (
          <>
            현재 <b className={styles.sDanger}>위험</b> 단계는 없습니다.{" "}
            <b className={styles.sCaution}>주의 {counts.caution}곳</b>은 파고·이안류를
            확인하세요.
          </>
        ) : (
          <>모든 해수욕장이 <b className={styles.sSafe}>안전</b> 단계입니다.</>
        )}
      </div>
    </div>
  );
}
