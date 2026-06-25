"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LEVELS, levelOf } from "@/lib/bsm/levels";
import {
  profileFromTransect,
  profileFromGrid,
  transectAt,
  depthAt,
  analyze,
  type BedProfile,
} from "@/lib/bsm/profile";
import { aiComment } from "@/lib/bsm/aiComment";
import type { TideKey } from "@/lib/bsm/types";
import type { BeachDetail } from "@/lib/api/aggregate";
import { DepthLegend } from "./DepthLegend";
import { AiCommentCard } from "./AiCommentCard";
import styles from "./crossSection.module.css";

const TIMES: { key: TideKey; label: string; clock: string }[] = [
  { key: "now", label: "현재", clock: "14:00" },
  { key: "t1", label: "1시간 후", clock: "15:00" },
  { key: "t2", label: "2시간 후", clock: "16:00" },
];

export function CrossSection({
  beach,
  compact = false,
  showAI = true,
}: {
  beach: BeachDetail;
  compact?: boolean;
  showAI?: boolean;
}) {
  const [p, setP] = useState(0.5);
  const [tideKey, setTideKey] = useState<TideKey>("now");
  const [drag, setDrag] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

  const tideOffset = beach.tideOffsets[tideKey];

  // p または grid に応じて BedProfile を構成
  const bed: BedProfile = useMemo(() => {
    if (beach.grid) {
      const g =
        p < 0.34
          ? beach.grid.left
          : p < 0.67
          ? beach.grid.center
          : beach.grid.right;
      return profileFromGrid(g);
    }
    return profileFromTransect(transectAt(beach.transects, p));
  }, [beach, p]);

  const move = useCallback((clientX: number) => {
    const el = planRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let np = (clientX - r.left) / r.width;
    np = Math.max(0.02, Math.min(0.98, np));
    setP(np);
  }, []);

  useEffect(() => {
    if (!drag) return;
    const mv = (e: PointerEvent) => move(e.clientX);
    const up = () => setDrag(false);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, move]);

  // ----- 단면도 기하 (CrossSection.jsx 26–30행 그대로) -----
  const VB_W = 820,
    VB_H = compact ? 300 : 340;
  const X0 = 56,
    X1 = VB_W - 18,
    D_MIN = -12,
    D_MAX = 80;
  const SURFACE_Y = 64,
    SCALE = (VB_H - 34 - SURFACE_Y) / 2.4;
  const xOf = (d: number) => X0 + ((d - D_MIN) / (D_MAX - D_MIN)) * (X1 - X0);
  const yOf = (depth: number) => SURFACE_Y + depth * SCALE;

  const cols: { x: number; w: number; y: number; h: number; color: string }[] = [];
  const bedPts: [number, number][] = [];
  for (let d = D_MIN; d <= D_MAX; d += 2) {
    const dep = depthAt(bed, tideOffset, d);
    bedPts.push([xOf(d), yOf(dep)]);
    if (dep > 0.02) {
      cols.push({
        x: xOf(d),
        w: ((X1 - X0) / (D_MAX - D_MIN)) * 2 + 0.6,
        y: SURFACE_Y,
        h: yOf(dep) - SURFACE_Y,
        color: levelOf(dep).cssVar,
      });
    }
  }

  const groundPath =
    `M ${xOf(D_MIN)} ${VB_H} L ` +
    bedPts.map((pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" L ") +
    ` L ${xOf(D_MAX)} ${VB_H} Z`;
  const bedLine =
    "M " +
    bedPts.map((pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" L ");

  const a = analyze(bed, tideOffset);
  const posName = p < 0.34 ? "좌측" : p < 0.67 ? "중앙" : "우측";

  // Y축 체감수심 가이드
  const guides = [
    { depth: 0.3, label: "발목" },
    { depth: 0.6, label: "무릎" },
    { depth: 1.0, label: "허리" },
    { depth: 1.5, label: "가슴 · 위험" },
  ];

  return (
    <div className={styles.xsec}>
      {/* 시간대 탭 */}
      <div className={styles.xsecTimes}>
        <span className={`${styles.xsecTimesLabel} mono`}>조위 시뮬레이션</span>
        <div className={styles.seg}>
          {TIMES.map((t) => (
            <button
              key={t.key}
              className={`${styles.segBtn}${tideKey === t.key ? ` ${styles.on}` : ""}`}
              onClick={() => setTideKey(t.key)}
            >
              {t.label}
              <em className="mono">{t.clock}</em>
            </button>
          ))}
        </div>
      </div>

      {/* 평면도 — 단면선 드래그 */}
      <div
        className={styles.plan}
        ref={planRef}
        onPointerDown={(e) => {
          setDrag(true);
          move(e.clientX);
        }}
      >
        <div className={styles.planSand}>
          <span>모래사장</span>
        </div>
        <div className={styles.planShore}>
          <span>해안선</span>
        </div>
        <div className={styles.planSea}>
          <span className={`${styles.planTag} ${styles.tagL}`}>얕은 바다</span>
          <span className={`${styles.planTag} ${styles.tagR}`}>깊은 바다</span>
        </div>
        {[0.16, 0.5, 0.84].map((m, i) => (
          <div
            key={i}
            className={styles.planTick}
            style={{ left: m * 100 + "%" }}
          >
            {["좌", "중앙", "우"][i]}
          </div>
        ))}
        <div className={styles.planLine} style={{ left: p * 100 + "%" }}>
          <div className={styles.planKnob}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path
                d="M3 4 L1 7 L3 10 M11 4 L13 7 L11 10"
                stroke="#fff"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className={styles.planLineCap}>단면선</div>
        </div>
      </div>

      {/* 수직 단면도 */}
      <div className={styles.profile}>
        <div className={styles.profileHead}>
          <strong>수직 단면도</strong>
          <span className="mono">
            {posName} 단면 · 해안선 기준 {D_MAX}m
          </span>
        </div>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className={styles.profileSvg}
          preserveAspectRatio="none"
        >
          {/* 수면 사각형 */}
          <rect
            x={X0}
            y={SURFACE_Y}
            width={X1 - X0}
            height={VB_H - 34 - SURFACE_Y}
            fill="var(--sky-50)"
          />
          {/* 수심 컬럼 */}
          {cols.map((c, i) => (
            <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.color} />
          ))}
          {/* 해저 채움 */}
          <path d={groundPath} fill="#E4D2B0" />
          {/* 해저선 */}
          <path d={bedLine} fill="none" stroke="#B79B68" strokeWidth="2" />
          {/* 수면선 */}
          <line
            x1={X0}
            y1={SURFACE_Y}
            x2={X1}
            y2={SURFACE_Y}
            stroke="#2f86f0"
            strokeWidth="2"
          />
          {/* Y축 가이드 */}
          {guides.map((g, i) => (
            <g key={i}>
              <line
                x1={X0}
                y1={yOf(g.depth)}
                x2={X1}
                y2={yOf(g.depth)}
                stroke="rgba(15,34,56,.12)"
                strokeDasharray="3 4"
              />
              <text x={8} y={yOf(g.depth) + 4} className={styles.profileAxis}>
                {g.label}
              </text>
            </g>
          ))}
          {/* 위험 시작 표시 */}
          {a.dangerStart && (
            <g>
              <line
                x1={xOf(a.dangerStart)}
                y1={SURFACE_Y - 8}
                x2={xOf(a.dangerStart)}
                y2={VB_H - 34}
                stroke="var(--danger)"
                strokeWidth="1.6"
                strokeDasharray="4 3"
              />
              <rect
                x={xOf(a.dangerStart) - 30}
                y={SURFACE_Y - 26}
                width="60"
                height="18"
                rx="9"
                fill="var(--danger)"
              />
              <text
                x={xOf(a.dangerStart)}
                y={SURFACE_Y - 13}
                className={styles.profileFlag}
              >
                {a.dangerStart}m 급경사
              </text>
            </g>
          )}
          {/* 추천 입수 구간 */}
          <line
            x1={xOf(0)}
            y1={VB_H - 22}
            x2={xOf(a.kneeEnd)}
            y2={VB_H - 22}
            stroke="var(--safe)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text
            x={(xOf(0) + xOf(a.kneeEnd)) / 2}
            y={VB_H - 9}
            className={styles.profileRec}
          >
            추천 입수 구간 0–{a.kneeEnd}m
          </text>
          {/* 거리 눈금 */}
          {[0, 20, 40, 60, 80].map((d) => (
            <text
              key={d}
              x={xOf(d)}
              y={SURFACE_Y - 30}
              className={`${styles.profileDist} mono`}
            >
              {d}m
            </text>
          ))}
        </svg>
        <DepthLegend />
      </div>

      {showAI && (
        <AiCommentCard beachName={beach.name} text={aiComment(a, p)} />
      )}
    </div>
  );
}
