"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 up to `value` on mount (easeOutCubic).
 * Respects prefers-reduced-motion (renders the final value immediately).
 */
export function CountUp({
  value,
  suffix,
  duration = 900,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce || duration <= 0) {
      raf.current = requestAnimationFrame(() => setN(value));
      return () => {
        if (raf.current) cancelAnimationFrame(raf.current);
      };
    }

    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(eased * value));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {n}
      {suffix}
    </span>
  );
}
