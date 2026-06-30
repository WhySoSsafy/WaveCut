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
import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./crossSection.module.css";

const TIMES: { key: TideKey; clock: string }[] = [
  { key: "now", clock: "14:00" },
  { key: "t1", clock: "15:00" },
  { key: "t2", clock: "16:00" },
];

export function CrossSection({
  beach,
  compact = false,
  showAI = true,
  hero = false,
}: {
  beach: BeachDetail;
  compact?: boolean;
  showAI?: boolean;
  /** Landing showcase: hide time tabs + hints, auto-sweep the transect smoothly. */
  hero?: boolean;
}) {
  const dict = useT();
  const Tx = dict.xsec;
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

  // 랜딩 히어로: 단면선을 왼쪽 1/5 ↔ 오른쪽 4/5 사이에서 끊김 없이 부드럽게 왕복
  useEffect(() => {
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      requestAnimationFrame(() => setP(0.5));
      return;
    }
    let raf = 0;
    let start = 0;
    let cancelled = false;
    const PERIOD = 11000; // 좌→우→좌 한 바퀴(ms) — 느리고 차분하게
    const tick = (t: number) => {
      if (cancelled) return;
      if (!start) start = t;
      const phase = ((t - start) / PERIOD) * Math.PI * 2;
      // cos(0)=1 → 0.2(좌 1/5), cos(π)=-1 → 0.8(우 4/5). 양 끝에서 자연스럽게 감속.
      setP(0.5 - 0.3 * Math.cos(phase));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hero]);

  // 첫 진입 시 단면선을 1/4 → 3/4 로 부드럽게 한 번 훑어 "드래그 가능"을 시연
  useEffect(() => {
    if (hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let start = 0;
    let cancelled = false;
    const DUR = 2600;
    const easeInOut = (x: number) =>
      x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const tick = (t: number) => {
      if (cancelled) return;
      if (!start) start = t;
      const el = (t - start) / DUR;
      if (el >= 1) {
        setP(0.5);
        return;
      }
      // 0.5 →(살짝 좌) 0.25 → 0.75 →(안착) 0.5 — 전 구간 부드럽게, 점프 없음
      const seg = (from: number, to: number, k: number) =>
        from + (to - from) * easeInOut(k);
      let p: number;
      if (el < 0.18) {
        p = seg(0.5, 0.25, el / 0.18);
      } else if (el < 0.78) {
        p = seg(0.25, 0.75, (el - 0.18) / 0.6);
      } else {
        p = seg(0.75, 0.5, (el - 0.78) / 0.22);
      }
      setP(p);
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
  }, [hero]);

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
  const posName =
    p < 0.34 ? Tx.sectionLeft : p < 0.67 ? Tx.sectionCenter : Tx.sectionRight;

  // Y축 체감수심 가이드
  const guides = [
    { depth: 0.3, label: dict.common.levels.ankle },
    { depth: 0.6, label: dict.common.levels.knee },
    { depth: 1.0, label: dict.common.levels.waist },
    { depth: 1.5, label: Tx.chestDanger },
  ];

  // 수면 물결 path (드리프트용으로 양옆 1주기씩 넉넉히)
  const WAVE_P = 80;
  const WAVE_AMP = 3.5;
  const waveSegs = Math.ceil((X1 - X0 + 4 * WAVE_P) / WAVE_P);
  let surfPath = `M ${X0 - 2 * WAVE_P} ${SURFACE_Y} q ${WAVE_P / 2} ${-WAVE_AMP} ${WAVE_P} 0`;
  for (let i = 0; i < waveSegs; i++) surfPath += ` t ${WAVE_P} 0`;

  return (
    <div className={styles.xsec}>
      {/* 시간대 탭 — 히어로(랜딩)에서는 숨김 */}
      {!hero && (
        <div className={styles.xsecTimes}>
          <span className={`${styles.xsecTimesLabel} mono`}>{Tx.tideSim}</span>
          <div className={styles.seg}>
            {TIMES.map((time) => (
              <button
                key={time.key}
                className={`${styles.segBtn}${tideKey === time.key ? ` ${styles.on}` : ""}`}
                onClick={() => setTideKey(time.key)}
              >
                {Tx[time.key]}
                <em className="mono">{time.clock}</em>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 평면도 — 단면선 드래그 (히어로에서는 자동 이동, 조작 비활성) */}
      <div
        className={styles.plan}
        ref={planRef}
        onPointerDown={hero ? undefined : (e) => startDrag(e.clientX)}
        style={hero ? { cursor: "default" } : undefined}
      >
        <div className={styles.planSand}>
          <span>{Tx.sand}</span>
        </div>
        <div className={styles.planShore}>
          <span>{Tx.shore}</span>
        </div>
        <div className={styles.planSea}>
          <span className={`${styles.planTag} ${styles.tagL}`}>{Tx.shallow}</span>
          <span className={`${styles.planTag} ${styles.tagR}`}>{Tx.deep}</span>
        </div>
        {[0.16, 0.5, 0.84].map((m, i) => (
          <div
            key={i}
            className={styles.planTick}
            style={{ left: m * 100 + "%" }}
          >
            {[Tx.left, Tx.center, Tx.right][i]}
          </div>
        ))}
        {/* 드래그 가능 힌트 — 첫 조작 전까지 표시 (히어로에서는 숨김) */}
        {!hero && !interacted && (
          <div className={styles.planHint} aria-hidden="true">
            <span className={styles.planHintArrow}>‹</span>
            {Tx.dragHint}
            <span className={styles.planHintArrow}>›</span>
          </div>
        )}
        <div className={styles.planLine} style={{ left: p * 100 + "%" }}>
          <div
            className={`${styles.planKnob}${interacted || hero ? "" : ` ${styles.planKnobHint}`}`}
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
          <div className={styles.planLineCap}>↔ {Tx.transectLine}</div>
        </div>
      </div>

      {/* 수직 단면도 */}
      <div className={styles.profile}>
        <div className={styles.profileHead}>
          <strong>{Tx.vProfile}</strong>
          <span className="mono">
            {posName} · {Tx.baseline} {D_MAX}m
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
                {a.dangerStart}m {Tx.steep}
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
            {Tx.recoZone} 0–{a.kneeEnd}m
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
        <p className={styles.profileNote}>{Tx.note}</p>
      </div>

      {showAI && (
        <AiCommentCard beachName={beach.name} text={aiComment(a, p)} />
      )}
    </div>
  );
}
