"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { levelOf } from "@/lib/bsm/levels";
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
  const [interacted, setInteracted] = useState(false);
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

  // 첫 진입 시 단면선을 한 번 좌우로 살짝 움직여 "드래그 가능"을 시연
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let start = 0;
    let cancelled = false;
    const DUR = 1700;
    const tick = (t: number) => {
      if (cancelled) return;
      if (!start) start = t;
      const el = (t - start) / DUR;
      if (el >= 1) {
        setP(0.5);
        return;
      }
      // 0.5 → 좌 → 우 → 0.5 (감쇠 사인 1.5주기)
      const wig = Math.sin(el * Math.PI * 3) * (1 - el) * 0.16;
      setP(0.5 + wig);
      raf = requestAnimationFrame(tick);
    };
    const startId = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(startId);
      if (raf) cancelAnimationFrame(raf);
    };
    // 마운트 1회만 시연
  }, []);

  const startDrag = (clientX: number) => {
    setInteracted(true);
    setDrag(true);
    move(clientX);
  };

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

  // 수면 물결 path (드리프트용으로 양옆 1주기씩 넉넉히)
  const WAVE_P = 80;
  const WAVE_AMP = 3.5;
  const waveSegs = Math.ceil((X1 - X0 + 4 * WAVE_P) / WAVE_P);
  let surfPath = `M ${X0 - 2 * WAVE_P} ${SURFACE_Y} q ${WAVE_P / 2} ${-WAVE_AMP} ${WAVE_P} 0`;
  for (let i = 0; i < waveSegs; i++) surfPath += ` t ${WAVE_P} 0`;

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
        onPointerDown={(e) => startDrag(e.clientX)}
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
        {/* 드래그 가능 힌트 — 첫 조작 전까지 표시 */}
        {!interacted && (
          <div className={styles.planHint} aria-hidden="true">
            좌우로 드래그해 보세요
          </div>
        )}
        <div className={styles.planLine} style={{ left: p * 100 + "%" }}>
          <div
            className={`${styles.planKnob}${interacted ? "" : ` ${styles.planKnobHint}`}`}
          >
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
          <div className={styles.planLineCap}>↔ 단면선</div>
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
          {/* 조위 차오름 clip — tideKey 변경 시 재생 */}
          <defs>
            <clipPath id={`xsecFill-${tideKey}`}>
              <rect
                key={tideKey}
                className={styles.fillRise}
                x={X0}
                y={SURFACE_Y}
                width={X1 - X0}
                height={VB_H - SURFACE_Y}
              />
            </clipPath>
          </defs>
          {/* 수면 사각형 */}
          <rect
            x={X0}
            y={SURFACE_Y}
            width={X1 - X0}
            height={VB_H - 34 - SURFACE_Y}
            fill="var(--sky-50)"
          />
          {/* 수심 컬럼 (조위 clip 적용) */}
          <g clipPath={`url(#xsecFill-${tideKey})`}>
            {cols.map((c, i) => (
              <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.color} />
            ))}
          </g>
          {/* 해저 채움 */}
          <path d={groundPath} fill="#E4D2B0" />
          {/* 해저선 */}
          <path d={bedLine} fill="none" stroke="#B79B68" strokeWidth="2" />
          {/* 수면선 (잔잔한 베이스) */}
          <line
            x1={X0}
            y1={SURFACE_Y}
            x2={X1}
            y2={SURFACE_Y}
            stroke="#2f86f0"
            strokeWidth="1.2"
            opacity="0.4"
          />
          {/* 물결치는 수면 + shimmer */}
          <g clipPath={`url(#xsecClipBox)`}>
            <path
              className={styles.surfWaveBack}
              d={surfPath}
              fill="none"
              stroke="#7FC6EE"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              className={styles.surfWaveFront}
              d={surfPath}
              fill="none"
              stroke="#2f86f0"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              className={styles.surfShimmer}
              x1={X0 - 2 * WAVE_P}
              y1={SURFACE_Y + 14}
              x2={X1 + 2 * WAVE_P}
              y2={SURFACE_Y + 14}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.5"
              strokeDasharray="2 26"
            />
          </g>
          <defs>
            <clipPath id="xsecClipBox">
              <rect x={X0} y={SURFACE_Y - 12} width={X1 - X0} height={VB_H - SURFACE_Y} />
            </clipPath>
          </defs>
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
          {a.dangerStart != null && (
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
              {/* 이안류 흐름 — 바다 쪽(+x)으로 흐르는 화살표 */}
              <g
                className={styles.ripFlowG}
                clipPath="url(#xsecClipBox)"
                stroke="var(--danger)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              >
                {[0, 1, 2].map((k) => {
                  const bx = xOf(a.dangerStart!) + 14;
                  const by = SURFACE_Y + 8;
                  return (
                    <path
                      key={k}
                      className={styles.ripChevron}
                      style={{ animationDelay: `${k * 0.5}s` }}
                      d={`M ${bx} ${by - 4} l 6 4 l -6 4`}
                    />
                  );
                })}
              </g>
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
        <p className={styles.profileNote}>
          ※ 수심 단면은 실측이 아닌 <b>대표 예시 프로파일</b>입니다. 조위는 시뮬레이션
          값이며, 실제 입수 전 현장 안전요원의 안내를 따르세요.
        </p>
      </div>

      {showAI && (
        <AiCommentCard beachName={beach.name} text={aiComment(a, p)} />
      )}
    </div>
  );
}
