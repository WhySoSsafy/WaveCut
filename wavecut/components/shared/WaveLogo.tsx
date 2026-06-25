import styles from "./shared.module.css";

export function WaveLogo({
  size = 32,
  radius,
  light,
}: {
  size?: number;
  radius?: number;
  light?: boolean;
}) {
  const r = radius != null ? radius : Math.round(size * 0.3);

  return (
    <span
      className={`${styles.waveLogo}${light ? ` ${styles.waveLogoLt}` : ""}`}
      style={{ width: size, height: size, borderRadius: r }}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M4 12.5c2.4 0 2.4-2.6 5.3-2.6s2.9 2.6 5.3 2.6 2.4-2.6 5.3-2.6 2.9 2.6 5.3 2.6"
            opacity={0.55}
          />
          <path d="M4 18.5c2.4 0 2.4-2.6 5.3-2.6s2.9 2.6 5.3 2.6 2.4-2.6 5.3-2.6 2.9 2.6 5.3 2.6" />
        </g>
        <line
          x1="16"
          y1="5.5"
          x2="16"
          y2="26.5"
          stroke="#fff"
          strokeWidth="1.6"
          strokeDasharray="2.2 2.6"
          strokeLinecap="round"
          opacity={0.9}
        />
        <circle cx="16" cy="18.2" r="2.5" fill="#fff" />
        <circle cx="16" cy="18.2" r="1" fill="var(--blue-600)" />
      </svg>
    </span>
  );
}
