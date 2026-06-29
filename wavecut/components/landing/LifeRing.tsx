/**
 * Flat life-ring mascot. `dx`/`dy` (−1..1) steer the pupils toward the cursor.
 * Pure SVG — no state; the parent passes the gaze direction.
 */
export function LifeRing({
  dx = 0,
  dy = 0,
  size = 132,
  className,
}: {
  dx?: number;
  dy?: number;
  size?: number;
  className?: string;
}) {
  const px = Math.max(-1, Math.min(1, dx)) * 2.8;
  const py = Math.max(-1, Math.min(1, dy)) * 2.8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="60" cy="104" rx="34" ry="6" fill="#0E2C53" opacity="0.10" />
      {/* ring: red/white quarters */}
      <circle cx="60" cy="58" r="40" fill="#fff" />
      <path
        d="M60 18 a40 40 0 0 1 40 40 h-18 a22 22 0 0 0 -22 -22 z"
        fill="#DC2626"
      />
      <path
        d="M100 58 a40 40 0 0 1 -40 40 v-18 a22 22 0 0 0 22 -22 z"
        fill="#fff"
      />
      <path
        d="M60 98 a40 40 0 0 1 -40 -40 h18 a22 22 0 0 0 22 22 z"
        fill="#DC2626"
      />
      <path
        d="M20 58 a40 40 0 0 1 40 -40 v18 a22 22 0 0 0 -22 22 z"
        fill="#fff"
      />
      <circle cx="60" cy="58" r="22" fill="#eaf6ff" />
      <circle
        cx="60"
        cy="58"
        r="40"
        fill="none"
        stroke="#0E2C53"
        strokeWidth="2.5"
        opacity="0.12"
      />
      {/* face — pupils steer with dx/dy */}
      <circle cx="51" cy="56" r="5" fill="#fff" />
      <circle cx="69" cy="56" r="5" fill="#fff" />
      <circle cx={51 + px} cy={56 + py} r="3" fill="#0E2C53" />
      <circle cx={69 + px} cy={56 + py} r="3" fill="#0E2C53" />
      <circle cx={51 + px - 0.9} cy={56 + py - 0.9} r="1" fill="#fff" />
      <circle cx={69 + px - 0.9} cy={56 + py - 0.9} r="1" fill="#fff" />
      <path
        d="M53 65 q7 6 14 0"
        stroke="#0E2C53"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="44" cy="63" r="3" fill="#ffb3b3" opacity="0.7" />
      <circle cx="76" cy="63" r="3" fill="#ffb3b3" opacity="0.7" />
    </svg>
  );
}
