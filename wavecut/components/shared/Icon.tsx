const paths = {
  wave: (props: React.SVGProps<SVGPathElement>) => (
    <path
      d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M2 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"
      {...props}
    />
  ),
  tide: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <path d="M2 13c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
      <path d="M8 3v6M5.5 5.5L8 3l2.5 2.5" />
    </g>
  ),
  rip: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 8l3-3M8 8l-2 3" />
    </g>
  ),
  family: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx="6" cy="5" r="2" />
      <circle cx="11.5" cy="6" r="1.5" />
      <path d="M3 14v-2a3 3 0 016 0v2M9.5 14v-1.5a2 2 0 014 0V14" />
    </g>
  ),
  weather: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <path d="M9 12h4a2.5 2.5 0 000-5 3.5 3.5 0 00-6.5-1" />
    </g>
  ),
  pin: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <path d="M8 14s5-4.5 5-8A5 5 0 003 6c0 3.5 5 8 5 8z" />
      <circle cx="8" cy="6" r="1.6" />
    </g>
  ),
  chevron: (props: React.SVGProps<SVGPathElement>) => (
    <path d="M6 4l4 4-4 4" {...props} />
  ),
  bell: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <path d="M4 7a4 4 0 018 0c0 4 1.5 5 1.5 5h-11S4 11 4 7z" />
      <path d="M6.5 14.5a1.8 1.8 0 003 0" />
    </g>
  ),
  alert: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <path d="M8 2l6 11H2L8 2z" />
      <path d="M8 7v3M8 11.5v.01" />
    </g>
  ),
  chart: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <path d="M3 13V3M3 13h10M6 11V8M9 11V5M12 11V7" />
    </g>
  ),
  doc: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <path d="M4 2h5l3 3v9H4z" />
      <path d="M9 2v3h3M6 8h4M6 11h4" />
    </g>
  ),
  grid: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <rect x="3" y="3" width="4" height="4" />
      <rect x="9" y="3" width="4" height="4" />
      <rect x="3" y="9" width="4" height="4" />
      <rect x="9" y="9" width="4" height="4" />
    </g>
  ),
  layers: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <path d="M8 2l6 3-6 3-6-3 6-3zM2 11l6 3 6-3M2 8l6 3 6-3" />
    </g>
  ),
  users: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx="6" cy="5" r="2.2" />
      <path d="M2.5 14a3.5 3.5 0 017 0M11 7a2 2 0 100-4M11.5 14a3 3 0 00-1-2.2" />
    </g>
  ),
  crowd: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx="5.5" cy="5" r="2" />
      <circle cx="10.5" cy="5" r="2" />
      <path d="M2 13.5a3.5 3.5 0 017 0M7 13.5a3.5 3.5 0 017 0" />
    </g>
  ),
  sun: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1" />
    </g>
  ),
  uv: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx="8" cy="9" r="3" />
      <path d="M8 2.5v1.2M2.6 9h1.2M12.2 9h1.2M4.2 5.2l.8.8M11 6l.8-.8" />
      <path d="M6.4 9.2L8 6.6l1.6 2.6" strokeWidth="1.3" />
    </g>
  ),
  car: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <path d="M2.5 11V8l1.5-3.5h8L13.5 8v3" />
      <path d="M2 11h12v1.5h-2V11M4 12.5V11" />
      <circle cx="4.5" cy="11" r="1" />
      <circle cx="11.5" cy="11" r="1" />
    </g>
  ),
  star: (props: React.SVGProps<SVGPathElement>) => (
    <path
      d="M8 2l1.8 3.9 4.2.5-3.1 2.9.8 4.2L8 11.4 4.3 13.5l.8-4.2L2 6.4l4.2-.5L8 2z"
      {...props}
    />
  ),
  user: (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx="8" cy="5" r="2.5" />
      <path d="M3 14a5 5 0 0110 0" />
    </g>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 18,
  color = "currentColor",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const s: React.CSSProperties = { width: size, height: size, display: "block" };
  const svgProps = {
    fill: "none" as const,
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const renderIcon = paths[name];
  const content = renderIcon ? renderIcon(svgProps as never) : null;

  return (
    <svg viewBox="0 0 16 16" style={s}>
      {content}
    </svg>
  );
}
