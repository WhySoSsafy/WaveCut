import { getAllSummaries } from "@/lib/api/aggregate";
import { OperatorTable } from "@/components/web/OperatorTable";
import { Icon } from "@/components/shared/Icon";
import styles from "@/components/web/web.module.css";

// KPI items (prototype-level static values from WebExtra.jsx)
const KPI = [
  { n: "5", l: "모니터링 해수욕장", s: null, mono: false },
  { n: "3", l: "위험·주의 구간", s: "caution", mono: false },
  { n: "1", l: "긴급 대응 필요", s: "danger", mono: false },
  { n: "06:00", l: "마지막 데이터 갱신", s: null, mono: true },
] as const;

// Static prototype alerts from WebExtra.jsx
const ALERTS = [
  { beach: "다대포 해수욕장", zone: "우측 갯골 구간", level: "danger" as const, msg: "이안류 위험 · 조위 급상승", time: "방금" },
  { beach: "송정 해수욕장", zone: "중앙 서핑 경계", level: "caution" as const, msg: "파고 1.1m 주의보", time: "8분 전" },
  { beach: "해운대 해수욕장", zone: "9번 망루 우측", level: "caution" as const, msg: "이안류 주의 구간 발생", time: "21분 전" },
];

// Static prototype deployment data from WebExtra.jsx
const DEPLOY = [
  { beach: "해운대", need: 8, now: 7, status: "caution" as const },
  { beach: "광안리", need: 6, now: 6, status: "safe" as const },
  { beach: "송정", need: 5, now: 3, status: "danger" as const },
  { beach: "다대포", need: 4, now: 4, status: "safe" as const },
];

const SC: Record<"safe" | "caution" | "danger", string> = {
  safe: "var(--safe)",
  caution: "var(--caution)",
  danger: "var(--danger)",
};

export default async function OperatorPage() {
  const beaches = await getAllSummaries();

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.secHead}>
        <h3>운영자 대시보드</h3>
        <span>위험 구간 모니터링 · 안내문 자동 생성 · 안전요원 배치 참고</span>
      </div>

      {/* KPI 행 */}
      <div className={styles.kpiRow}>
        {KPI.map((k, i) => (
          <div key={i} className={styles.kpi}>
            <b
              className={k.s ? styles["s" + k.s.charAt(0).toUpperCase() + k.s.slice(1)] : undefined}
              style={k.mono ? { fontFamily: "var(--mono)", fontSize: 26 } : undefined}
            >
              {k.n}
            </b>
            <span>{k.l}</span>
          </div>
        ))}
      </div>

      {/* 실시간 해수욕장 상태 테이블 */}
      <div>
        <div className={styles.secHead}>
          <h3>해수욕장 현황</h3>
          <span className="mono">실시간 데이터 기반</span>
        </div>
        <div className={styles.panel}>
          <OperatorTable beaches={beaches} />
        </div>
      </div>

      {/* 2-컬럼: 위험 구간 + 안전요원 배치 */}
      <div className={styles.opGrid}>
        {/* 실시간 위험 구간 모니터링 */}
        <div className={styles.panel}>
          <div className={styles.panelH}>
            <strong>실시간 위험 구간 모니터링</strong>
            <span className="mono">
              <i className="dot" style={{ background: "var(--danger)", display: "inline-block", width: 8, height: 8, borderRadius: "50%", marginRight: 4 }} />
              LIVE
            </span>
          </div>
          <div className={styles.alertList}>
            {ALERTS.map((a, i) => (
              <div key={i} className={styles.alertItem}>
                <span className={styles.alertBar} style={{ background: SC[a.level] }} />
                <div className={styles.alertMain}>
                  <div className={styles.alertTop}>
                    <b>{a.beach}</b>
                    <span
                      className={styles.alertPill}
                      style={{ color: SC[a.level], background: SC[a.level] + "22" }}
                    >
                      {a.level === "danger" ? "위험" : "주의"}
                    </span>
                  </div>
                  <div className={styles.alertZone}>{a.zone} · {a.msg}</div>
                </div>
                <span className={`${styles.alertTime} mono`}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 안전요원 배치 참고 */}
        <div className={styles.panel}>
          <div className={styles.panelH}>
            <strong>안전요원 배치 참고</strong>
            <span className="mono">권장 인원</span>
          </div>
          <div className={styles.deployList}>
            {DEPLOY.map((d, i) => (
              <div key={i} className={styles.deployRow}>
                <b>{d.beach}</b>
                <div className={styles.deployBar}>
                  <i
                    style={{
                      display: "block",
                      height: "100%",
                      width: (d.now / d.need * 100) + "%",
                      background: SC[d.status],
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span className={`${styles.deployNum} mono`} style={{ color: SC[d.status] }}>
                  {d.now}/{d.need}명
                </span>
              </div>
            ))}
          </div>
          <div className={styles.tideNote}>
            <Icon name="users" size={14} color="var(--blue-600)" />
            송정은 권장 대비 2명 부족, 추가 배치를 권장합니다.
          </div>
        </div>
      </div>

      {/* AI 안내문 자동 생성 */}
      <div className={styles.panel}>
        <div className={styles.panelH}>
          <strong>AI 안내문 자동 생성</strong>
          <span className="mono">현장 방송·게시용 초안</span>
        </div>
        <div className={styles.noticeCard}>
          <div className={`${styles.noticeTag} mono`}>자동 생성 · 다대포 해수욕장 · 16:00</div>
          <p>
            안내 말씀드립니다. 현재 다대포 해수욕장 우측 갯골 구간에 이안류 위험이 감지되었습니다.
            해당 구간은 조위 상승으로 수심이 빠르게 깊어지고 있으니, 어린이와 초보자는 입수를 자제하시고
            안전요원이 지정한 안전구역에서만 물놀이를 즐겨 주시기 바랍니다.
          </p>
          <div className={styles.noticeActions}>
            <button className={styles.btnPrimary}>방송 송출</button>
            <button className={styles.btnGhost}>전광판 게시</button>
            <button className={styles.btnGhost}>문안 다시 생성</button>
          </div>
        </div>
      </div>
    </div>
  );
}
