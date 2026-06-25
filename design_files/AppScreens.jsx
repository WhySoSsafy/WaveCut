// ===== 모바일 앱 화면 =====
function AppPhone() {
  const B = window.BSM;
  const [tab, setTab] = React.useState("home");
  const [beachId, setBeachId] = React.useState("haeundae");
  const [sub, setSub] = React.useState(null); // detail | xsec
  const beach = B.BEACHES.find((b) => b.id === beachId);
  const go = (id) => { setBeachId(id); setSub("detail"); };

  let body;
  if (sub === "detail") body = <AppDetail beach={beach} onXsec={() => setSub("xsec")} onBack={() => setSub(null)} />;
  else if (sub === "xsec") body = <AppXsec beach={beach} onBack={() => setSub("detail")} />;
  else if (tab === "home") body = <AppHome onOpen={go} />;
  else if (tab === "fav") body = <AppFavorites onHome={() => setTab("home")} />;
  else if (tab === "mine") body = <AppMine onFav={() => setTab("fav")} />;

  const tabs = [
    { key: "home", label: "홈", icon: "grid" },
    { key: "fav", label: "즐겨찾기", icon: "star" },
    { key: "mine", label: "마이페이지", icon: "user" },
  ];
  return (
    <div className="phone">
      <div className="phone-status mono"><span>9:41</span><span className="ps-r"><i></i><i></i><b>100%</b></span></div>
      <div className="phone-screen">{body}</div>
      <nav className="phone-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={"ptab" + (tab === t.key && !sub ? " on" : "")} onClick={() => { setTab(t.key); setSub(null); }}>
            <Icon name={t.icon} size={20} color={tab === t.key && !sub ? "var(--blue-600)" : "var(--ink-3)"} />{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function AppHome({ onOpen }) {
  const B = window.BSM;
  const rec = B.BEACHES[0];
  return (
    <div className="ascroll">
      <div className="abrand">
        <WaveLogo size={30} radius={9} />
        <WaveWordmark size="sm" />
      </div>
      <div className="ahome-top">
        <div><span className="ahome-hello mono">부산 · 오늘 14:00</span><h2>안전한 바다, 지금 확인하세요</h2></div>
      </div>

      <div className="arec" onClick={() => onOpen(rec.id)}>
        <div className="arec-img"><span className="bcard-img-tag mono">해운대 전경</span><span className="arec-flag mono">오늘의 추천</span></div>
        <div className="arec-body">
          <div className="arec-top"><b>{rec.name}</b><StatusPill status={rec.status}/></div>
          <p>{rec.summary}</p>
          <div className="arec-stats">
            <span><Icon name="sun" size={14} color="var(--blue-600)"/>{rec.sky} {rec.air}℃</span>
            <span><Icon name="uv" size={14} color="var(--ink-3)"/>자외선 {rec.uv}</span>
            <span><Icon name="crowd" size={14} color="var(--ink-3)"/>{rec.crowd}</span>
          </div>
        </div>
      </div>

      <div className="asec-h">주요 해수욕장<span className="mono">5곳</span></div>
      <div className="alist">
        {B.BEACHES.map((b) => (
          <button key={b.id} className="arow" onClick={() => onOpen(b.id)}>
            <span className="arow-thumb" style={{ background: SBG[b.status] }}><Icon name="sun" size={18} color={SC[b.status]}/></span>
            <div className="arow-main">
              <div className="arow-name">{b.name}<StatusPill status={b.status}/></div>
              <div className="arow-meta mono">{b.sky} {b.air}℃ · 자외선 {b.uv} · 혼잡 {b.crowd}</div>
            </div>
            <Icon name="chevron" size={16} color="var(--ink-3)"/>
          </button>
        ))}
      </div>
    </div>
  );
}

function AppDetail({ beach, onXsec, onBack }) {
  return (
    <div className="ascroll">
      <AppBar title={beach.name} onBack={onBack} />
      <div className="adetail-hero" data-s={beach.status}>
        <div className="bcard-img-grid"></div>
        <div className="adetail-hero-b">
          <StatusPill status={beach.status} big />
          <ScoreGauge score={beach.score} status={beach.status} size={72}/>
        </div>
      </div>
      <div className="adetail-easy">
        <div className="aeasy"><Icon name="sun" size={16} color="var(--blue-600)"/><b>{beach.sky}</b><span>{beach.air}℃</span></div>
        <div className="aeasy"><Icon name="uv" size={16} color={beach.uv === "높음" ? "var(--caution)" : "var(--ink-3)"}/><b>자외선</b><span>{beach.uv}</span></div>
        <div className="aeasy"><Icon name="crowd" size={16} color={beach.crowd === "많음" ? "var(--caution)" : "var(--ink-3)"}/><b>혼잡도</b><span>{beach.crowd}</span></div>
      </div>
      <button className="apark">
        <span className="apark-ic"><Icon name="car" size={16} color="var(--blue-600)"/></span>
        <span className="apark-txt">근처 주차장 보기<em className="mono">{beach.parkDist}</em></span>
        <Icon name="chevron" size={15} color="var(--ink-3)"/>
      </button>
      <div className="asec-h">해양 안전 분석</div>
      <div className="ametric-grid">
        <AMetric icon="wave" label="파고" value={beach.wave + "m"} status={beach.wave > 1 ? "caution" : "safe"} />
        <AMetric icon="tide" label="조위" value={beach.tide} status="safe" note={beach.tideTrend} />
        <AMetric icon="rip" label="이안류" value={beach.rip} status={beach.rip === "안전" ? "safe" : beach.rip === "주의" ? "caution" : "danger"} />
        <AMetric icon="family" label="가족 이용" value={beach.family ? "추천" : "주의"} status={beach.family ? "safe" : "caution"} />
      </div>
      <button className="abtn-primary" onClick={onXsec}>단면 수심 보기<Icon name="chevron" size={15} color="#fff"/></button>
    </div>
  );
}

function AppSituationTips({ beach }) {
  const tips = window.BSM.situationTips(beach, 0.5, "now");
  return (
    <div className="aitips-wrap">
      <div className="asec-h">상황별 권장 행동</div>
      <div className="aitips">
        {tips.map((t) => (
          <div key={t.key} className="aitip" style={{ background: SBG[t.s] }}>
            <span className="aitip-dot" style={{ background: SC[t.s] }}></span>
            <div><b style={{ color: SC[t.s] }}>{t.t}</b><p>{t.d}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AMetric({ icon, label, value, status, note }) {
  return (
    <div className="ametric" style={{ borderColor: SC[status] + "33" }}>
      <span className="ametric-ic" style={{ background: SBG[status], color: SC[status] }}><Icon name={icon} size={16}/></span>
      <div className="ametric-label">{label}</div>
      <div className="ametric-val" style={{ color: SC[status] }}>{value}{note && <em className="mono"> {note}</em>}</div>
    </div>
  );
}

function AppXsec({ beach, onBack }) {
  return (
    <div className="ascroll axsec">
      <AppBar title="단면 수심 뷰" onBack={onBack} />
      <CrossSection beach={beach} compact key={beach.id} />
      <AppSituationTips beach={beach} />
    </div>
  );
}

function AppFavorites({ onHome }) {
  return (
    <div className="ascroll">
      <div className="ahome-top"><div><span className="ahome-hello mono">자주 찾는 해수욕장</span><h2>즐겨찾기</h2></div></div>
      <div className="afav-empty">
        <span className="afav-ic"><Icon name="star" size={26} color="var(--blue-600)"/></span>
        <b>아직 즐겨찾기한 해수욕장이 없습니다</b>
        <p>자주 방문하는 해수욕장을 저장하면<br/>안전 정보를 더 빠르게 확인할 수 있어요.</p>
        <button className="abtn-primary afav-btn" onClick={onHome}>홈에서 해수욕장 보기<Icon name="chevron" size={15} color="#fff"/></button>
      </div>
    </div>
  );
}

function AppMine({ onFav }) {
  const rows = [
    { icon: "star", t: "즐겨찾기 관리", v: "", act: onFav },
    { icon: "doc", t: "데이터 출처 안내", v: "" },
    { icon: "layers", t: "서비스 이용 안내", v: "" },
    { icon: "alert", t: "면책 · 안전 유의사항", v: "" },
  ];
  return (
    <div className="ascroll">
      <div className="ahome-top"><div><span className="ahome-hello mono">웨이브컷 WaveCut</span><h2>마이페이지</h2></div></div>
      <div className="amine-card">
        <span className="amine-avatar"><Icon name="user" size={22} color="#fff"/></span>
        <div><b>부산 시민</b><span className="mono">가족 단위 이용자</span></div>
      </div>
      <div className="amine-list">
        {rows.map((r, i) => (
          <button key={i} className="amine-row" onClick={r.act}>
            <span className="amine-ic"><Icon name={r.icon} size={17} color="var(--blue-600)"/></span>
            <b>{r.t}</b>
            <span className="amine-v mono">{r.v}</span>
            <Icon name="chevron" size={15} color="var(--ink-3)"/>
          </button>
        ))}
      </div>
      <div className="legal sm">본 서비스의 안전 정보는 공공데이터 기반 AI 추정 결과로 실제와 다를 수 있습니다.</div>
    </div>
  );
}

function AppBar({ title, onBack }) {
  return (
    <div className="abar">
      <button className="abar-back" onClick={onBack}><svg width="18" height="18" viewBox="0 0 18 18"><path d="M11 4l-5 5 5 5" stroke="var(--navy-900)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      <b>{title}</b><span></span>
    </div>
  );
}

Object.assign(window, { AppPhone });
