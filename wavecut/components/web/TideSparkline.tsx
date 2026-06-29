"use client";

import { useEffect, useState } from "react";
import styles from "./web.module.css";

interface Point {
  label: string;
  h: number; // 체감 수심 높이 (m)
}

const W = 300;
const X = [30, 150, 270];
const Y_TOP = 16;
const Y_BASE = 78;
const SCALE_MAX = 1.6;

function yFor(h: number): number {
  const frac = Math.max(0, Math.min(h / SCALE_MAX, 1));
  return +(Y_BASE - frac * (Y_BASE - Y_TOP)).toFixed(1);
}

/**
 * Animated SVG tide curve for 현재 / 1시간 후 / 2시간 후.
 * Line draws left→right and the area fades up on mount.
 */
export function TideSparkline({ points }: { points: Point[] }) {
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

  const ys = points.map((p) => yFor(p.h));
  const line = `M${X[0]} ${ys[0]} L${X[1]} ${ys[1]} L${X[2]} ${ys[2]}`;
  const area = `${line} L${X[2]} ${Y_BASE} L${X[0]} ${Y_BASE} Z`;
  const dotsOn = reduce || on;

  return (
    <svg
      className={styles.tideSpark}
      viewBox={`0 0 ${W} 96`}
      preserveAspectRatio="none"
      role="img"
      aria-label="시간대별 조위 곡선"
    >
      <defs>
        <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky-400)" stopOpacity="0.34" />
          <stop offset="100%" stopColor="var(--sky-400)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <path
        d={area}
        fill="url(#tideFill)"
        style={{
          opacity: on ? 1 : 0,
          transition: reduce ? "none" : "opacity 0.9s ease 0.25s",
        }}
      />
      <path
        d={line}
        fill="none"
        stroke="var(--blue-600)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={on || reduce ? 0 : 1}
        style={{
          transition: reduce
            ? "none"
            : "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      {points.map((p, i) => (
        <circle
          key={p.label}
          cx={X[i]}
          cy={ys[i]}
          r={i === 0 ? 4.5 : 3.5}
          fill="#fff"
          stroke={i === 0 ? "var(--blue-600)" : "var(--sky-400)"}
          strokeWidth="2.5"
          style={{
            opacity: dotsOn ? 1 : 0,
            transition: reduce
              ? "none"
              : `opacity 0.3s ease ${0.5 + i * 0.25}s`,
          }}
        />
      ))}
    </svg>
  );
}
