"use client";

import { useEffect, useState } from "react";
import { CountUp } from "@/components/shared/CountUp";
import { useT } from "@/lib/i18n/LocaleProvider";
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
  const dict = useT();
  const D = dict.dash;
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
          <span>{D.monitoring}</span>
        </div>
      </div>
      <div className={styles.donutLegend}>
        <div className={styles.donutLeg}>
          <i style={{ background: "var(--safe)" }} />
          {dict.common.safe} <b><CountUp value={counts.safe} /></b>
        </div>
        <div className={styles.donutLeg}>
          <i style={{ background: "var(--caution)" }} />
          {dict.common.caution} <b><CountUp value={counts.caution} /></b>
        </div>
        <div className={styles.donutLeg}>
          <i style={{ background: "var(--danger)" }} />
          {dict.common.danger} <b><CountUp value={counts.danger} /></b>
        </div>
      </div>
      <div className={styles.donutMsg}>
        {counts.danger > 0 ? (
          <>
            <b className={styles.sDanger}>
              {D.donutDanger} {counts.danger}
            </b>
            {D.donutDangerTail}
          </>
        ) : counts.caution > 0 ? (
          <>
            {D.donutNoDangerA}{" "}
            <b className={styles.sDanger}>{D.donutNoDangerHi}</b>{" "}
            {D.donutNoDangerB}{" "}
            <b className={styles.sCaution}>
              {D.donutCaution} {counts.caution}
            </b>
            {D.donutCautionTail}
          </>
        ) : (
          <>
            {D.donutAllSafe1}{" "}
            <b className={styles.sSafe}>{D.donutAllSafe2}</b>
            {D.donutAllSafe3}
          </>
        )}
      </div>
    </div>
  );
}
