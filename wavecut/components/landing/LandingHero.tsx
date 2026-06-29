"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { levelOf } from "@/lib/bsm/levels";
import { LifeRing } from "./LifeRing";
import styles from "./landing.module.css";

// ----- scene geometry (SVG viewBox coords) -----
const W = 560;
const H = 380;
const WATER_Y = 120;
const SHORE_X = 70;
const SCALE = 74; // px per meter
const MAX_DEPTH = 2.6; // m at the far (deep) edge

// seabed Y at a given x: beach above water on the left, deepening to the right
function bedY(x: number): number {
  if (x <= SHORE_X) {
    const u = Math.max(0, x) / SHORE_X; // 0..1 across the beach
    return WATER_Y - 46 * (1 - u); // beach surface above water
  }
  const u = (x - SHORE_X) / (W - SHORE_X); // 0..1 across the water
  const eased = u * 0.42 + u * u * 0.58; // gentle near shore, steeper offshore
  return WATER_Y + eased * MAX_DEPTH * SCALE;
}
function depthMeters(x: number): number {
  return Math.max(0, (bedY(x) - WATER_Y) / SCALE);
}

const BED_PTS = (() => {
  const pts: [number, number][] = [];
  for (let x = 0; x <= W; x += 7) pts.push([x, +bedY(x).toFixed(1)]);
  return pts;
})();
const BED_LINE = "M " + BED_PTS.map((p) => `${p[0]} ${p[1]}`).join(" L ");
const SAND_PATH = `${BED_LINE} L ${W} ${H} L 0 ${H} Z`;
const WATER_PATH =
  `M ${SHORE_X} ${WATER_Y} L ${W} ${WATER_Y} L ${W} ${bedY(W).toFixed(1)} ` +
  BED_PTS.filter((p) => p[0] >= SHORE_X)
    .reverse()
    .map((p) => `L ${p[0]} ${p[1]}`)
    .join(" ") +
  " Z";

const RING = { x: 92, y: 56 }; // mascot float position (top-left, clear of labels)

export function LandingHero() {
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const lastRippleRef = useRef(0);
  const rippleId = useRef(0);

  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [autoX, setAutoX] = useState(W * 0.5);
  const [reduce, setReduce] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>(
    []
  );

  // idle auto-demo sweep until the user interacts
  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (r) {
      const id = requestAnimationFrame(() => {
        setReduce(true);
        setAutoX(W * 0.62);
      });
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const loop = (t: number) => {
      if (!start) start = t;
      const el = ((t - start) / 5200) % 1; // 5.2s loop
      // ease across 0.18..0.86 of the width and back
      const tri = el < 0.5 ? el * 2 : 2 - el * 2;
      const e = tri < 0.5 ? 2 * tri * tri : 1 - Math.pow(-2 * tri + 2, 2) / 2;
      setAutoX(W * (0.2 + 0.62 * e));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toSvg = (clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * W,
      y: ((clientY - r.top) / r.height) * H,
    };
  };

  const onMove = (e: React.PointerEvent) => {
    if (reduce) return;
    pendingRef.current = toSvg(e.clientX, e.clientY);
    if (!interacted) setInteracted(true);
    // spawn ripple (throttled)
    const now = e.timeStamp;
    if (pendingRef.current && now - lastRippleRef.current > 130) {
      lastRippleRef.current = now;
      const { x, y } = pendingRef.current;
      if (y >= WATER_Y - 24) {
        const id = rippleId.current++;
        setRipples((rs) => [...rs.slice(-5), { id, x, y: Math.max(y, WATER_Y) }]);
        window.setTimeout(
          () => setRipples((rs) => rs.filter((r) => r.id !== id)),
          900
        );
      }
    }
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingRef.current) setPointer(pendingRef.current);
      });
    }
  };

  const onLeave = () => {
    setPointer(null);
    setInteracted(false);
  };

  // marker x: cursor if interacting, else the idle sweep
  const markerX = Math.max(
    SHORE_X + 10,
    Math.min(W - 28, pointer && interacted ? pointer.x : autoX)
  );
  const my = bedY(markerX);
  const depth = depthMeters(markerX);
  const level = levelOf(depth);

  // person silhouette (1.6 m tall) standing on the seabed
  const personH = 1.6 * SCALE;
  const headY = my - personH;

  // pupils look at the cursor, else at the wader
  const gazeTarget = pointer ?? { x: markerX, y: my - personH * 0.5 };
  const gdx = gazeTarget.x - RING.x;
  const gdy = gazeTarget.y - RING.y;
  const gmag = Math.hypot(gdx, gdy) || 1;

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>부산 해수욕장 안전 서비스</span>
          <h1 className={styles.title}>
            우리 가족 바다,
            <br />
            지금 <span className={styles.titleHi}>안전한가요?</span>
          </h1>
          <p className={styles.lede}>
            수심을 숫자가 아닌 <b>발목·무릎·허리·가슴</b> 체감 단계로. 실시간
            공공데이터로 부산 해변의 안전을 한눈에 확인하세요.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/dashboard" className={styles.ctaPrimary}>
              서비스 들어가기
              <span aria-hidden="true">→</span>
            </Link>
            <a href="#features" className={styles.ctaGhost}>
              기능 살펴보기 ↓
            </a>
          </div>
        </div>

        <div className={styles.heroScene}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className={styles.scene}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            role="img"
            aria-label="마우스를 따라 체감 수심이 바뀌는 해변 단면"
          >
            <defs>
              <linearGradient id="lhWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7FC6EE" />
                <stop offset="100%" stopColor="#1554b8" />
              </linearGradient>
              <linearGradient id="lhSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#eaf6ff" />
                <stop offset="100%" stopColor="#d3ecfb" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width={W} height={WATER_Y} fill="url(#lhSky)" />
            <path d={WATER_PATH} fill="url(#lhWater)" opacity="0.92" />
            <path d={SAND_PATH} fill="#E7D3A6" />
            <path d={BED_LINE} fill="none" stroke="#caa86a" strokeWidth="2" />

            {/* depth guide lines on the wader */}
            {[
              { d: 0.3, label: "발목" },
              { d: 0.6, label: "무릎" },
              { d: 1.0, label: "허리" },
              { d: 1.5, label: "가슴" },
            ].map((g) => (
              <line
                key={g.label}
                x1={SHORE_X}
                y1={WATER_Y + g.d * SCALE}
                x2={W}
                y2={WATER_Y + g.d * SCALE}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="2 5"
              />
            ))}

            {/* cursor ripples */}
            {ripples.map((r) => (
              <circle
                key={r.id}
                className={styles.ripple}
                cx={r.x}
                cy={r.y}
                r="4"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2"
              />
            ))}

            {/* wader: clean person silhouette standing on the seabed */}
            <g className={reduce ? undefined : styles.markerEase}>
              {(() => {
                const neckY = headY + 17;
                const hipY = neckY + personH * 0.4;
                const shoulderY = neckY + 4;
                return (
                  <g
                    stroke="var(--navy-900)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="none"
                  >
                    <circle
                      cx={markerX}
                      cy={headY + 9}
                      r="8.5"
                      fill="var(--navy-900)"
                      stroke="none"
                    />
                    <line x1={markerX} y1={neckY} x2={markerX} y2={hipY} />
                    <line x1={markerX} y1={hipY} x2={markerX - 6} y2={my} />
                    <line x1={markerX} y1={hipY} x2={markerX + 6} y2={my} />
                    <line
                      x1={markerX}
                      y1={shoulderY}
                      x2={markerX - 11}
                      y2={shoulderY + personH * 0.28}
                      strokeWidth="6"
                    />
                    <line
                      x1={markerX}
                      y1={shoulderY}
                      x2={markerX + 11}
                      y2={shoulderY + personH * 0.28}
                      strokeWidth="6"
                    />
                  </g>
                );
              })()}
              {/* water overlay tints the submerged part of the body */}
              <rect
                x={markerX - 20}
                y={WATER_Y}
                width="40"
                height={Math.max(0, my - WATER_Y)}
                fill="url(#lhWater)"
                opacity="0.45"
              />
              {/* marker line + level label */}
              <line
                x1={markerX}
                y1={WATER_Y - 30}
                x2={markerX}
                y2={my}
                stroke="#fff"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.85"
              />
              <g
                transform={`translate(${Math.max(46, Math.min(W - 46, markerX))} ${WATER_Y - 40})`}
              >
                <rect
                  x="-44"
                  y="-15"
                  width="88"
                  height="30"
                  rx="15"
                  fill={level.cssVar}
                />
                <text className={styles.lvlText} x="0" y="5">
                  {level.label} · {depth.toFixed(1)}m
                </text>
              </g>
            </g>

            {/* surface waves */}
            <path
              className={reduce ? undefined : styles.surf}
              d={
                `M -80 ${WATER_Y} q 40 -6 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0` +
                ` V ${WATER_Y + 4} H -80 Z`
              }
              fill="#fff"
              opacity="0.5"
            />

            {/* mascot life-ring floating, eyes follow cursor.
                Position on the outer <g> (attribute); animate on the inner <g>
                — a CSS transform would otherwise replace the position transform. */}
            <g transform={`translate(${RING.x - 30} ${RING.y - 30})`}>
              <g className={reduce ? undefined : styles.bob}>
                <LifeRing dx={gdx / gmag} dy={gdy / gmag} size={60} />
              </g>
            </g>
          </svg>

          {!interacted && !reduce && (
            <div className={styles.sceneHint} aria-hidden="true">
              마우스를 움직여 보세요
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
