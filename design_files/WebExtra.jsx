// ===== 운영자 대시보드 & 데이터 출처 =====
function WebOperator() {
  const B = window.BSM;
  const alerts = [
    { beach: "다대포 해수욕장", zone: "우측 갯골 구간", level: "danger", msg: "이안류 위험 · 조위 급상승", time: "방금" },
    { beach: "송정 해수욕장", zone: "중앙 서핑 경계", level: "caution", msg: "파고 1.1m 주의보", time: "8분 전" },
    { beach: "해운대 해수욕장", zone: "9번 망루 우측", level: "caution", msg: "이안류 주의 구간 발생", time: "21분 전" },
  ];
  const deploy = [
    { beach: "해운대", need: 8, now: 7, status: "caution" },
    { beach: "광안리", need: 6, now: 6, status: "safe" },
    { beach: "송정", need: 5, now: 3, status: "danger" },
    { beach: "다대포", need: 4, now: 4, status: "safe" },
  ];
  return (
    <div className="page">
      <div className="sec-head"><h3>운영자 대시보드</h3><span>위험 구간 모니터링 · 안내문 자동 생성 · 안전요원 배치 참고</span></div>
      <div className="kpi-row">
        {[
          { n: "24", l: "모니터링 해수욕장", s: null },
          { n: "3", l: "위험·주의 구간", s: "caution" },
          { n: "1", l: "긴급 대응 필요", s: "danger" },
          { n: "06:00", l: "마지막 데이터 갱신", s: null, mono: true },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <b className={k.s ? "s-" + k.s : ""} style={k.mono ? { fontFamily: "var(--mono)", fontSize: 26 } : null}>{k.n}</b>
            <span>{k.l}</span>
          </div>
        ))}
      </div>

      <div className="op-grid">
        <div className="panel">
          <div className="panel-h"><strong>실시간 위험 구간 모니터링</strong><span className="mono"><i className="dot bg-danger"></i>LIVE</span></div>
          <div className="alert-list">
            {alerts.map((a, i) => (
              <div key={i} className="alert-item">
                <span className="alert-bar" style={{ background: SC[a.level] }}></span>
                <div className="alert-main">
                  <div className="alert-top"><b>{a.beach}</b><StatusPill status={a.level}/></div>
                  <div className="alert-zone">{a.zone} · {a.msg}</div>
                </div>
                <span className="alert-time mono">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-h"><strong>안전요원 배치 참고</strong><span className="mono">권장 인원</span></div>
          <div className="deploy-list">
            {deploy.map((d, i) => (
              <div key={i} className="deploy-row">
                <b>{d.beach}</b>
                <div className="deploy-bar">
                  <i style={{ width: (d.now / d.need * 100) + "%", background: SC[d.status] }}></i>
                </div>
                <span className="deploy-num mono" style={{ color: SC[d.status] }}>{d.now}/{d.need}명</span>
              </div>
            ))}
          </div>
          <div className="tide-note"><Icon name="users" size={14} color="var(--blue-600)"/>송정은 권장 대비 2명 부족, 추가 배치를 권장합니다.</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-h"><strong>AI 안내문 자동 생성</strong><span className="mono">현장 방송·게시용 초안</span></div>
        <div className="notice-card">
          <div className="notice-tag mono">자동 생성 · 다대포 해수욕장 · 16:00</div>
          <p>안내 말씀드립니다. 현재 다대포 해수욕장 우측 갯골 구간에 이안류 위험이 감지되었습니다. 해당 구간은 조위 상승으로 수심이 빠르게 깊어지고 있으니, 어린이와 초보자는 입수를 자제하시고 안전요원이 지정한 안전구역에서만 물놀이를 즐겨 주시기 바랍니다.</p>
          <div className="notice-actions">
            <button className="btn btn-primary">방송 송출</button>
            <button className="btn btn-ghost">전광판 게시</button>
            <button className="btn btn-ghost">문안 다시 생성</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebSources() {
  const B = window.BSM;
  const uses = [
    { tag: "수심", src: "국립해양조사원 수심정보", use: "단면 수심도 생성" },
    { tag: "조위", src: "국립해양조사원 조위관측소", use: "체감 수심 보정·예측" },
    { tag: "파고", src: "기상청 파랑 예보", use: "물놀이 위험도 판단" },
    { tag: "이안류", src: "해양경찰청 이안류 지수", use: "위험 구간 강조" },
    { tag: "날씨", src: "기상청 동네예보", use: "수온·기상 안내" },
  ];
  return (
    <div className="page">
      <div className="sec-head"><h3>데이터 출처 및 활용</h3><span>공공데이터 기반 서비스 · 매일 06:00 자동 갱신</span></div>
      <div className="panel">
        <div className="src-grid">
          {uses.map((u) => (
            <div key={u.tag} className="src-cell">
              <span className="src-tag mono">{u.tag}</span>
              <b>{u.src}</b>
              <span className="src-use">{u.use}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="legal">
        <div className="legal-h"><Icon name="alert" size={16} color="var(--caution)"/>예측 한계 및 법적 주의 안내</div>
        본 서비스의 안전점수와 체감 수심은 공공데이터를 활용한 AI 예측 결과로, 실제 현장 상황과 다를 수 있으며 법적 효력이 없습니다. 입수 전 반드시 현장 안전요원의 안내와 기상·해양 특보를 확인하시기 바랍니다.
      </div>
    </div>
  );
}

Object.assign(window, { WebOperator, WebSources });
