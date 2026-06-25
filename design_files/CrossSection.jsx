// ===== 단면 수심 뷰 (인터랙티브) =====
function CrossSection({ beach, compact, showAI = true }) {
  const B = window.BSM;
  const [p, setP] = React.useState(0.5);       // 단면선 위치(0~1, 해안 따라)
  const [tideKey, setTideKey] = React.useState("now");
  const planRef = React.useRef(null);
  const [drag, setDrag] = React.useState(false);

  const move = React.useCallback((clientX) => {
    const el = planRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    let np = (clientX - r.left) / r.width;
    np = Math.max(0.02, Math.min(0.98, np));
    setP(np);
  }, []);
  React.useEffect(() => {
    if (!drag) return;
    const mv = (e) => move(e.touches ? e.touches[0].clientX : e.clientX);
    const up = () => setDrag(false);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag, move]);

  // ----- 단면도 기하 -----
  const VB_W = 820, VB_H = compact ? 300 : 340;
  const X0 = 56, X1 = VB_W - 18, D_MIN = -12, D_MAX = 80;
  const SURFACE_Y = 64, SCALE = (VB_H - 34 - SURFACE_Y) / 2.4;
  const xOf = (d) => X0 + ((d - D_MIN) / (D_MAX - D_MIN)) * (X1 - X0);
  const yOf = (depth) => SURFACE_Y + depth * SCALE;

  const cols = [], bedPts = [];
  for (let d = D_MIN; d <= D_MAX; d += 2) {
    const dep = B.depthAt(beach, p, tideKey, d);
    bedPts.push([xOf(d), yOf(dep)]);
    if (dep > 0.02) {
      const lv = B.levelOf(dep);
      cols.push({ x: xOf(d), w: ((X1 - X0) / (D_MAX - D_MIN)) * 2 + 0.6, y: SURFACE_Y, h: yOf(dep) - SURFACE_Y, color: lv.color });
    }
  }
  const groundPath = `M ${xOf(D_MIN)} ${VB_H} L ` + bedPts.map((pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" L ") + ` L ${xOf(D_MAX)} ${VB_H} Z`;
  const bedLine = "M " + bedPts.map((pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" L ");

  const a = B.analyze(beach, p, tideKey);
  const posName = p < 0.34 ? "좌측" : p < 0.67 ? "중앙" : "우측";

  // Y축 체감수심 가이드
  const guides = [
    { depth: 0.3, label: "발목" }, { depth: 0.6, label: "무릎" },
    { depth: 1.0, label: "허리" }, { depth: 1.5, label: "가슴 · 위험" },
  ];

  return (
    <div className="xsec">
      {/* 시간대 탭 */}
      <div className="xsec-times">
        <span className="xsec-times-label mono">조위 시뮬레이션</span>
        <div className="seg">
          {B.TIMES.map((t) => (
            <button key={t.key} className={"seg-btn" + (tideKey === t.key ? " on" : "")} onClick={() => setTideKey(t.key)}>
              {t.label}<em className="mono">{t.clock}</em>
            </button>
          ))}
        </div>
      </div>

      {/* 평면도 — 단면선 드래그 */}
      <div className="plan" ref={planRef}
        onPointerDown={(e) => { setDrag(true); move(e.clientX); }}>
        <div className="plan-sand"><span>모래사장</span></div>
        <div className="plan-shore"><span>해안선</span></div>
        <div className="plan-sea">
          <span className="plan-tag tag-l">얕은 바다</span>
          <span className="plan-tag tag-r">깊은 바다</span>
        </div>
        {[0.16, 0.5, 0.84].map((m, i) => (
          <div key={i} className="plan-tick" style={{ left: m * 100 + "%" }}>{["좌","중앙","우"][i]}</div>
        ))}
        <div className="plan-line" style={{ left: p * 100 + "%" }}>
          <div className="plan-knob"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 4 L1 7 L3 10 M11 4 L13 7 L11 10" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg></div>
          <div className="plan-line-cap">단면선</div>
        </div>
      </div>

      {/* 수직 단면도 */}
      <div className="profile">
        <div className="profile-head">
          <strong>수직 단면도</strong>
          <span className="mono">{posName} 단면 · 해안선 기준 {D_MAX}m</span>
        </div>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="profile-svg" preserveAspectRatio="none">
          <rect x={X0} y={SURFACE_Y} width={X1 - X0} height={VB_H - 34 - SURFACE_Y} fill="var(--sky-50)"/>
          {cols.map((c, i) => <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.color}/>)}
          <path d={groundPath} fill="#E4D2B0"/>
          <path d={bedLine} fill="none" stroke="#B79B68" strokeWidth="2"/>
          {/* 수면선 */}
          <line x1={X0} y1={SURFACE_Y} x2={X1} y2={SURFACE_Y} stroke="#2f86f0" strokeWidth="2"/>
          {/* Y축 가이드 */}
          {guides.map((g, i) => (
            <g key={i}>
              <line x1={X0} y1={yOf(g.depth)} x2={X1} y2={yOf(g.depth)} stroke="rgba(15,34,56,.12)" strokeDasharray="3 4"/>
              <text x={8} y={yOf(g.depth) + 4} className="profile-axis">{g.label}</text>
            </g>
          ))}
          {/* 위험 시작 표시 */}
          {a.dangerStart && (
            <g>
              <line x1={xOf(a.dangerStart)} y1={SURFACE_Y - 8} x2={xOf(a.dangerStart)} y2={VB_H - 34} stroke="var(--danger)" strokeWidth="1.6" strokeDasharray="4 3"/>
              <rect x={xOf(a.dangerStart) - 30} y={SURFACE_Y - 26} width="60" height="18" rx="9" fill="var(--danger)"/>
              <text x={xOf(a.dangerStart)} y={SURFACE_Y - 13} className="profile-flag">{a.dangerStart}m 급경사</text>
            </g>
          )}
          {/* 추천 입수 구간 */}
          <line x1={xOf(0)} y1={VB_H - 22} x2={xOf(a.kneeEnd)} y2={VB_H - 22} stroke="var(--safe)" strokeWidth="3" strokeLinecap="round"/>
          <text x={(xOf(0) + xOf(a.kneeEnd)) / 2} y={VB_H - 9} className="profile-rec">추천 입수 구간 0–{a.kneeEnd}m</text>
          {/* 거리 눈금 */}
          {[0, 20, 40, 60, 80].map((d) => (
            <text key={d} x={xOf(d)} y={SURFACE_Y - 30} className="profile-dist mono">{d}m</text>
          ))}
        </svg>
        <div className="depth-legend">
          {B.LEVELS.map((l) => (
            <span key={l.key} className="dl-item"><i style={{ background: l.color }}></i>{l.label}</span>
          ))}
        </div>
      </div>

      {showAI && <AIComment beach={beach} text={B.aiComment(beach, p, tideKey)} />}
    </div>
  );
}

function AIComment({ beach, text }) {
  return (
    <div className="ai-card">
      <div className="ai-head">
        <span className="ai-badge">AI</span>
        <strong>AI 안전 코멘트</strong>
        <span className="ai-live mono"><i></i>실시간 해석</span>
      </div>
      <p className="ai-body">{text}</p>
      <div className="ai-foot mono">수심 · 조위 · 파고 · 이안류 데이터를 종합한 추정 결과입니다.</div>
    </div>
  );
}

window.CrossSection = CrossSection;
window.AIComment = AIComment;
