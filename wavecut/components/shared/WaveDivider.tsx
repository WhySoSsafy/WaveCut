import styles from "./WaveDivider.module.css";

/**
 * Decorative animated sea-wave layer. Pure SVG + CSS (no JS).
 * Drop into a position:relative container; sits at the bottom.
 * Animation pauses under prefers-reduced-motion.
 */
export function WaveDivider({
  className,
  color = "rgba(255, 255, 255, 0.45)",
  height = 44,
  z = 3,
}: {
  className?: string;
  color?: string;
  height?: number;
  z?: number;
}) {
  return (
    <div
      className={`${styles.waves}${className ? ` ${className}` : ""}`}
      style={{ height, zIndex: z }}
      aria-hidden="true"
    >
      <svg
        className={styles.svg}
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
      >
        {/* back layer — slower, fainter */}
        <path
          className={styles.waveBack}
          fill={color}
          fillOpacity={0.5}
          d="M0 34 q 150 -22 300 0 t 300 0 t 300 0 t 300 0 t 300 0 t 300 0 t 300 0 t 300 0 L2400 60 L0 60 Z"
        />
        {/* front layer — faster, fuller */}
        <path
          className={styles.waveFront}
          fill={color}
          d="M0 40 q 150 22 300 0 t 300 0 t 300 0 t 300 0 t 300 0 t 300 0 t 300 0 t 300 0 L2400 60 L0 60 Z"
        />
      </svg>
    </div>
  );
}
