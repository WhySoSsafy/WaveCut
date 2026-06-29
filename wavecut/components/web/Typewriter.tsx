"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./web.module.css";

/**
 * Types out `text` character by character (AI-generated feel).
 * Respects prefers-reduced-motion (shows full text, no caret animation).
 */
export function Typewriter({
  text,
  speed = 18,
  className,
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      const id = requestAnimationFrame(() => {
        setShown(text.length);
        setDone(true);
      });
      return () => cancelAnimationFrame(id);
    }
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          if (timer.current) clearInterval(timer.current);
          setDone(true);
          return n;
        }
        return n + 1;
      });
    }, speed);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [text, speed]);

  return (
    <p className={className}>
      {text.slice(0, shown)}
      {!done && <span className={styles.twCaret} aria-hidden="true" />}
    </p>
  );
}
