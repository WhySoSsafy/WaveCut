"use client";

import { useEffect, useRef, useState } from "react";
import { LifeRing } from "./LifeRing";
import styles from "./landing.module.css";

/** Life-ring mascot whose eyes follow the cursor anywhere on the page. */
export function MascotGaze({ size = 128 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const [gaze, setGaze] = useState({ dx: 0, dy: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.46; // eye line is a bit above center
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const m = Math.hypot(dx, dy) || 1;
        setGaze({ dx: dx / m, dy: dy / m });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div ref={ref} className={styles.mascot}>
      <LifeRing dx={gaze.dx} dy={gaze.dy} size={size} />
    </div>
  );
}
