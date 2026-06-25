// ===== 외부 셸: 웹 / 앱 토글 =====
function Shell() {
  const [view, setView] = React.useState("web");
  return (
    <div className="shell">
      <div className="chrome">
        <div className="chrome-brand">
          <WaveLogo size={28} radius={9} />
          <WaveWordmark light size="sm" />
          <em className="mono">MVP 시연</em>
        </div>
        <div className="chrome-toggle">
          <button className={view === "web" ? "on" : ""} onClick={() => setView("web")}>웹 대시보드</button>
          <button className={view === "app" ? "on" : ""} onClick={() => setView("app")}>모바일 앱</button>
        </div>
        <span className="chrome-note mono">공공데이터 기반 · 부산 해수욕장 안전 서비스</span>
      </div>
      <div className={"stage " + view}>
        {view === "web" ? <WebApp /> : <AppPhone />}
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Shell />);
