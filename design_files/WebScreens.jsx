// ===== 웹 (대시보드) 화면 =====
function WebApp() {
  const B = window.BSM;
  const [route, setRoute] = React.useState("dashboard");
  const [beachId, setBeachId] = React.useState("haeundae");
  const beach = B.BEACHES.find((b) => b.id === beachId);
  const open = (id) => { setBeachId(id); setRoute("detail"); };

  const nav = [
    { key: "dashboard", label: "메인 대시보드", icon: "grid" },
    { key: "detail", label: "단면 수심 뷰", icon: "layers" },
    { key: "operator", label: "운영자 대시보드", icon: "users" },
    { key: "sources", label: "데이터 출처", icon: "doc" },
  ];

  return (
    <div className="web">
      <header className="web-head">
        <div className="brand">
          <WaveLogo size={36} radius={11} />
          <WaveWordmark size="lg" />
        </div>
        <div className="web-search">
          <Icon name="pin" size={15} color="var(--ink-3)"/>
          <input placeholder="부산 해수욕장 검색" defaultValue=""/>
        </div>
        <div className="web-head-right">
          <span className="updated mono"><i className="dot bg-safe"></i>실시간 · 06:00 갱신</span>
          <span className="src-chips">
            {B.DATA_SOURCES.map((s) => <em key={s.tag} className="mono">{s.tag}</em>)}
          </span>
        </div>
      </header>
      <div className="web-body">
        <aside className="web-side">
          <div className="side-label mono">MENU</div>
          {nav.map((n) => (
            <button key={n.key} className={"side-item" + (route === n.key ? " on" : "")} onClick={() => setRoute(n.key)}>
              <Icon name={n.icon} size={17}/>{n.label}
            </button>
          ))}
          <div className="side-note">
            <div className="side-note-h"><Icon name="alert" size={14} color="var(--caution)"/>예측 정보 안내</div>
            본 정보는 공공데이터 기반 추정값입니다. 입수 전 현장 안전요원의 안내를 따르세요.
          </div>
        </aside>
        <main className="web-main">
          {route === "dashboard" && <WebDashboard onOpen={open} />}
          {route === "detail" && <WebDetail beach={beach} onPick={setBeachId} />}
          {route === "operator" && <WebOperator />}
          {route === "sources" && <WebSources />}
        </main>
      </div>
    </div>
  );
}

function WebDashboard({ onOpen }) {
  const B = window.BSM;
  const feat = B.BEACHES[0];
  const stat = { safe: 0, caution: 0, danger: 0 };
  B.BEACHES.forEach((b) => stat[b.status]++);
  return (
    <div className="page">
      <div className="page-hero">
        <div>
          <h1>우리 가족 바다, 오늘 안전한가요?</h1>
          <p>실시간 공공데이터를 AI가 분석해 부산 주요 해수욕장의 체감 수심과 안전 등급을 알려드립니다.</p>
        </div>
        <div className="hero-summary">
          <div className="hsum"><b className="s-safe">{stat.safe}</b><span>안전</span></div>
          <div className="hsum"><b className="s-caution">{stat.caution}</b><span>주의</span></div>
          <div className="hsum"><b className="s-danger">{stat.danger}</b><span>위험</span></div>
          <div className="hsum hsum-div"><b>24</b><span>모니터링</span></div>
        </div>
      </div>

      <section>
        <SectionHead title="오늘의 추천 해수욕장" sub="가족 단위 이용에 적합한 곳을 우선 추천합니다" />
        <FeatureRow beach={feat} onOpen={() => onOpen(feat.id)} />
      </section>

      <section>
        <SectionHead title="주요 해수욕장 안전 현황" sub="부산 5개 대표 해수욕장 · 카드를 눌러 단면 수심을 확인하세요" />
        <div className="bcard-grid">
          {B.BEACHES.map((b) => <BeachCard key={b.id} beach={b} feature={b.feature} onOpen={() => onOpen(b.id)} />)}
        </div>
      </section>
    </div>
  );
}

function FeatureRow({ beach, onOpen }) {
  return (
    <div className="feat-row">
      <div className="feat-img">
        <div className="bcard-img-grid"></div>
        <span className="bcard-img-tag mono">해운대 해변 전경</span>
      </div>
      <div className="feat-info">
        <div className="feat-top">
          <StatusPill status={beach.status} big />
          <span className="fam fam-ok"><Icon name="sun" size={15}/>{beach.sky} · {beach.air}℃</span>
        </div>
        <h2>{beach.name}</h2>
        <p>{beach.summary} 넓은 모래턱과 완만한 경사로 가족 단위 물놀이에 적합한 대표 해수욕장입니다.</p>
        <div className="feat-stats">
          <Stat icon="sun" label="날씨" value={beach.sky} unit={" · " + beach.air + "℃"}/>
          <Stat icon="uv" label="자외선" value={beach.uv} status={beach.uv === "높음" ? "caution" : "safe"}/>
          <Stat icon="crowd" label="예상 혼잡도" value={beach.crowd} status={beach.crowd === "많음" ? "caution" : "safe"}/>
          <Stat icon="weather" label="수온" value={beach.water} unit="℃"/>
        </div>
        <button className="btn btn-primary" onClick={onOpen}>상세 보기<Icon name="chevron" size={14} color="#fff"/></button>
      </div>
      <ScoreGauge score={beach.score} status={beach.status} size={120} />
    </div>
  );
}

function SectionHead({ title, sub }) {
  return <div className="sec-head"><h3>{title}</h3><span>{sub}</span></div>;
}

// ----- 해운대 상세 / 단면 수심 뷰 -----
function WebDetail({ beach, onPick }) {
  const B = window.BSM;
  return (
    <div className="page">
      <div className="detail-bar">
        <div className="tabbar">
          {B.BEACHES.map((b) => (
            <button key={b.id} className={"tab" + (b.id === beach.id ? " on" : "")} onClick={() => onPick(b.id)}>
              {b.name.replace(" 해수욕장", "")}
              <i className="dot" style={{ background: SC[b.status] }}></i>
            </button>
          ))}
        </div>
      </div>

      <div className="detail-head">
        <div>
          <div className="dh-name"><h1>{beach.name}</h1><StatusPill status={beach.status} big /></div>
          <div className="dh-meta"><Icon name="pin" size={14} color="var(--ink-3)"/>{beach.region} · 해안선 길이 {beach.length}km · <Icon name="sun" size={14} color="var(--ink-3)"/>{beach.sky} {beach.air}℃ · 자외선 {beach.uv} · 예상 혼잡도 {beach.crowd}</div>
        </div>
        <div className="dh-stats">
          <ScoreGauge score={beach.score} status={beach.status} size={80}/>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="panel">
            <div className="panel-h"><strong>단면 수심 뷰</strong><span className="mono">평면도에서 단면선을 드래그하세요</span></div>
            <CrossSection beach={beach} key={beach.id} />
          </div>
          <SituationTips beach={beach} />
        </div>
        <aside className="detail-aside">
          <SafetyMetricsPanel beach={beach} />
          <ParkingPanel beach={beach} />
          <TideForecast beach={beach} />
          <SourcePanel compact />
        </aside>
      </div>
    </div>
  );
}

function SafetyMetricsPanel({ beach }) {
  const ripS = beach.rip === "안전" ? "safe" : beach.rip === "주의" ? "caution" : "danger";
  return (
    <div className="panel">
      <div className="panel-h"><strong>해양 안전 분석</strong><span className="mono">전문 지표</span></div>
      <div className="safety-metrics">
        <Stat icon="wave" label="파고" value={beach.wave} unit="m" status={beach.wave > 1 ? "caution" : "safe"}/>
        <Stat icon="tide" label="조위" value={beach.tide} unit={" · " + beach.tideTrend} status="safe"/>
        <Stat icon="rip" label="이안류" value={beach.rip} status={ripS}/>
        <Stat icon="family" label="가족 이용" value={beach.family ? "추천" : "주의"} status={beach.family ? "safe" : "caution"}/>
      </div>
    </div>
  );
}

function ParkingPanel({ beach }) {
  return (
    <div className="panel">
      <div className="panel-h"><strong>주차 안내</strong><span className="mono">현장 이용 정보</span></div>
      <div className="park-row">
        <span className="park-ic"><Icon name="car" size={18} color="var(--blue-600)"/></span>
        <div className="park-info"><b>{beach.parking}</b><span className="mono">{beach.parkDist}</span></div>
      </div>
      <div className="park-actions">
        <button className="btn btn-ghost sm">근처 주차장 보기</button>
        <button className="btn btn-ghost sm">지도에서 확인</button>
      </div>
    </div>
  );
}

function SituationTips({ beach }) {
  const tips = window.BSM.situationTips(beach, 0.5, "now");
  return (
    <div className="panel">
      <div className="panel-h"><strong>상황별 권장 행동</strong><span className="mono">AI 안전 가이드</span></div>
      <div className="sit-grid">
        {tips.map((t) => (
          <div key={t.key} className="sit-card" style={{ borderColor: SC[t.s] + "33" }}>
            <span className="sit-ic" style={{ background: SBG[t.s], color: SC[t.s] }}><Icon name={t.icon} size={16}/></span>
            <b style={{ color: SC[t.s] }}>{t.t}</b>
            <p>{t.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TideForecast({ beach }) {
  const rows = [
    { t: "14:00", label: "현재", h: 1.2, d: "무릎" },
    { t: "15:00", label: "1시간 후", h: 1.55, d: "허리" },
    { t: "16:00", label: "2시간 후", h: 1.9, d: "가슴" },
    { t: "17:00", label: "3시간 후", h: 2.0, d: "가슴" },
  ];
  const max = 2.2;
  return (
    <div className="panel">
      <div className="panel-h"><strong>시간대별 체감 수심</strong><span className="mono">조위 예측</span></div>
      <div className="tide-rows">
        {rows.map((r, i) => (
          <div key={i} className={"tide-row" + (i === 0 ? " now" : "")}>
            <span className="tide-t mono">{r.t}</span>
            <div className="tide-bar"><i style={{ width: (r.h / max * 100) + "%", background: i < 1 ? "var(--d-knee)" : i < 3 ? "var(--d-waist)" : "var(--d-chest)" }}></i></div>
            <span className="tide-d">{r.d}<em className="mono"> {r.h}m</em></span>
          </div>
        ))}
      </div>
      <div className="tide-note"><Icon name="tide" size={14} color="var(--blue-600)"/>오후로 갈수록 조위가 상승해 같은 위치의 체감 수심이 깊어집니다.</div>
    </div>
  );
}

function SourcePanel({ compact }) {
  const B = window.BSM;
  return (
    <div className="panel">
      <div className="panel-h"><strong>공공데이터 출처</strong><span className="mono">매일 06:00</span></div>
      <div className="src-list">
        {B.DATA_SOURCES.map((s) => (
          <div key={s.name} className="src-item">
            <span className="src-tag mono">{s.tag}</span>
            <div><b>{s.name}</b><span>{s.use}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { WebApp });
