// ===== 공용 UI 컴포넌트 =====
const SC = { safe: "var(--safe)", caution: "var(--caution)", danger: "var(--danger)" };
const SBG = { safe: "var(--safe-bg)", caution: "var(--caution-bg)", danger: "var(--danger-bg)" };
const SLABEL = { safe: "안전", caution: "주의", danger: "위험" };

function StatusPill({ status, children, big }) {
  return (
    <span className={"pill" + (big ? " pill-big" : "")} style={{ color: SC[status], background: SBG[status] }}>
      <i className="dot" style={{ background: SC[status] }}></i>{children || SLABEL[status]}
    </span>
  );
}

// 미니 아이콘 세트 (단순 도형)
function Icon({ name, size = 18, color = "currentColor" }) {
  const s = { width: size, height: size, display: "block" };
  const props = { fill: "none", stroke: color, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    wave: <path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M2 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" {...props}/>,
    tide: <g {...props}><path d="M2 13c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M8 3v6M5.5 5.5L8 3l2.5 2.5"/></g>,
    rip:  <g {...props}><circle cx="8" cy="8" r="6"/><path d="M8 8l3-3M8 8l-2 3"/></g>,
    family: <g {...props}><circle cx="6" cy="5" r="2"/><circle cx="11.5" cy="6" r="1.5"/><path d="M3 14v-2a3 3 0 016 0v2M9.5 14v-1.5a2 2 0 014 0V14"/></g>,
    weather: <g {...props}><circle cx="6" cy="6" r="2.5"/><path d="M9 12h4a2.5 2.5 0 000-5 3.5 3.5 0 00-6.5-1"/></g>,
    pin: <g {...props}><path d="M8 14s5-4.5 5-8A5 5 0 003 6c0 3.5 5 8 5 8z"/><circle cx="8" cy="6" r="1.6"/></g>,
    chevron: <path d="M6 4l4 4-4 4" {...props}/>,
    bell: <g {...props}><path d="M4 7a4 4 0 018 0c0 4 1.5 5 1.5 5h-11S4 11 4 7z"/><path d="M6.5 14.5a1.8 1.8 0 003 0"/></g>,
    alert: <g {...props}><path d="M8 2l6 11H2L8 2z"/><path d="M8 7v3M8 11.5v.01"/></g>,
    chart: <g {...props}><path d="M3 13V3M3 13h10M6 11V8M9 11V5M12 11V7"/></g>,
    doc: <g {...props}><path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3M6 8h4M6 11h4"/></g>,
    grid: <g {...props}><rect x="3" y="3" width="4" height="4"/><rect x="9" y="3" width="4" height="4"/><rect x="3" y="9" width="4" height="4"/><rect x="9" y="9" width="4" height="4"/></g>,
    layers: <g {...props}><path d="M8 2l6 3-6 3-6-3 6-3zM2 11l6 3 6-3M2 8l6 3 6-3"/></g>,
    users: <g {...props}><circle cx="6" cy="5" r="2.2"/><path d="M2.5 14a3.5 3.5 0 017 0M11 7a2 2 0 100-4M11.5 14a3 3 0 00-1-2.2"/></g>,
    crowd: <g {...props}><circle cx="5.5" cy="5" r="2"/><circle cx="10.5" cy="5" r="2"/><path d="M2 13.5a3.5 3.5 0 017 0M7 13.5a3.5 3.5 0 017 0"/></g>,
    sun: <g {...props}><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M12.6 3.4l-1 1M4.4 11.6l-1 1"/></g>,
    uv: <g {...props}><circle cx="8" cy="9" r="3"/><path d="M8 2.5v1.2M2.6 9h1.2M12.2 9h1.2M4.2 5.2l.8.8M11 6l.8-.8"/><path d="M6.4 9.2L8 6.6l1.6 2.6" strokeWidth="1.3"/></g>,
    car: <g {...props}><path d="M2.5 11V8l1.5-3.5h8L13.5 8v3"/><path d="M2 11h12v1.5h-2V11M4 12.5V11"/><circle cx="4.5" cy="11" r="1"/><circle cx="11.5" cy="11" r="1"/></g>,
    star: <path d="M8 2l1.8 3.9 4.2.5-3.1 2.9.8 4.2L8 11.4 4.3 13.5l.8-4.2L2 6.4l4.2-.5L8 2z" {...props}/>,
    user: <g {...props}><circle cx="8" cy="5" r="2.5"/><path d="M3 14a5 5 0 0110 0"/></g>,
  };
  return <svg viewBox="0 0 16 16" style={s}>{paths[name] || null}</svg>;
}

// 데이터 미니 스탯
function Stat({ icon, label, value, unit, status }) {
  return (
    <div className="stat">
      <span className="stat-ic" style={status ? { background: SBG[status], color: SC[status] } : null}><Icon name={icon} size={16}/></span>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}<em>{unit}</em></div>
      </div>
    </div>
  );
}

// 안전점수 게이지(반원)
function ScoreGauge({ score, status, size = 96 }) {
  const r = size / 2 - 8, c = Math.PI * r, off = c * (1 - score / 100);
  const cx = size / 2;
  return (
    <div className="gauge" style={{ width: size, height: size / 2 + 14 }}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path d={`M8 ${size/2} A ${r} ${r} 0 0 1 ${size-8} ${size/2}`} fill="none" stroke="var(--line)" strokeWidth="8" strokeLinecap="round"/>
        <path d={`M8 ${size/2} A ${r} ${r} 0 0 1 ${size-8} ${size/2}`} fill="none" stroke={SC[status]} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}/>
      </svg>
      <div className="gauge-num" style={{ color: SC[status] }}>{score}<span>점</span></div>
    </div>
  );
}

function BeachCard({ beach, onOpen, feature }) {
  const B = window.BSM;
  return (
    <button className={"bcard" + (feature ? " bcard-feat" : "")} onClick={onOpen}>
      {feature && <span className="bcard-flag mono">MVP 대표</span>}
      <div className="bcard-img" data-region={beach.region}>
        <div className="bcard-img-grid"></div>
        <span className="bcard-img-tag mono">해변 이미지</span>
        <div className="bcard-status"><StatusPill status={beach.status}/></div>
      </div>
      <div className="bcard-body">
        <div className="bcard-top">
          <div>
            <div className="bcard-name">{beach.name}</div>
            <div className="bcard-region"><Icon name="pin" size={13} color="var(--ink-3)"/>{beach.region}</div>
          </div>
          <ScoreGauge score={beach.score} status={beach.status} size={72}/>
        </div>
        <div className="bcard-stats">
          <Stat icon="sun" label="날씨" value={beach.sky} unit={" · " + beach.air + "℃"}/>
          <Stat icon="uv" label="자외선" value={beach.uv} status={beach.uv === "높음" ? "caution" : "safe"}/>
          <Stat icon="crowd" label="예상 혼잡도" value={beach.crowd} status={beach.crowd === "많음" ? "caution" : "safe"}/>
        </div>
        <div className="bcard-foot">
          <StatusPill status={beach.status}/>
          <span className="bcard-cta">상세 보기<Icon name="chevron" size={13}/></span>
        </div>
      </div>
    </button>
  );
}

Object.assign(window, { StatusPill, Icon, Stat, ScoreGauge, BeachCard, SC, SBG, SLABEL });

// ===== 브랜드: 웨이브컷 WaveCut =====
// 로고 마크 — 둥근 스퀘어 위에 물결 + 수심 단면(세로 컷) 모티프
function WaveLogo({ size = 32, radius, light }) {
  const r = radius != null ? radius : Math.round(size * 0.3);
  return (
    <span className={"wave-logo" + (light ? " wave-logo-lt" : "")} style={{ width: size, height: size, borderRadius: r }}>
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
        <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12.5c2.4 0 2.4-2.6 5.3-2.6s2.9 2.6 5.3 2.6 2.4-2.6 5.3-2.6 2.9 2.6 5.3 2.6" opacity=".55"/>
          <path d="M4 18.5c2.4 0 2.4-2.6 5.3-2.6s2.9 2.6 5.3 2.6 2.4-2.6 5.3-2.6 2.9 2.6 5.3 2.6"/>
        </g>
        <line x1="16" y1="5.5" x2="16" y2="26.5" stroke="#fff" strokeWidth="1.6" strokeDasharray="2.2 2.6" strokeLinecap="round" opacity=".9"/>
        <circle cx="16" cy="18.2" r="2.5" fill="#fff"/>
        <circle cx="16" cy="18.2" r="1" fill="var(--blue-600)"/>
      </svg>
    </span>
  );
}

// 워드마크 — 한글 메인 + 영문 보조(라운드 워드마크)
function WaveWordmark({ light, sub = true, size = "md" }) {
  return (
    <div className={"wc-lockup wc-" + size + (light ? " wc-lt" : "")}>
      <span className="wc-ko">웨이브컷</span>
      {sub && <span className="wc-en">Wave<b>Cut</b></span>}
    </div>
  );
}

Object.assign(window, { WaveLogo, WaveWordmark });
