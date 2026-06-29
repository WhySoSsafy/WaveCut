import { getAllSummaries } from "@/lib/api/aggregate";
import { OperatorTable } from "@/components/web/OperatorTable";
import { Icon } from "@/components/shared/Icon";
import { CountUp } from "@/components/shared/CountUp";
import { Typewriter } from "@/components/web/Typewriter";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/web/web.module.css";

// Static prototype alerts (zone/msg stay Korean — operational broadcast content)
const ALERTS = [
  { id: "dadaepo" as const, zone: "우측 갯골 구간", level: "danger" as const, msg: "이안류 위험 · 조위 급상승", time: "방금" },
  { id: "songjeong" as const, zone: "중앙 서핑 경계", level: "caution" as const, msg: "파고 1.1m 주의보", time: "8분 전" },
  { id: "haeundae" as const, zone: "9번 망루 우측", level: "caution" as const, msg: "이안류 주의 구간 발생", time: "21분 전" },
];

// Static prototype deployment data
const DEPLOY = [
  { id: "haeundae" as const, need: 8, now: 7, status: "caution" as const },
  { id: "gwangalli" as const, need: 6, now: 6, status: "safe" as const },
  { id: "songjeong" as const, need: 5, now: 3, status: "danger" as const },
  { id: "dadaepo" as const, need: 4, now: 4, status: "safe" as const },
];

const SC: Record<"safe" | "caution" | "danger", string> = {
  safe: "var(--safe)",
  caution: "var(--caution)",
  danger: "var(--danger)",
};

export default async function OperatorPage() {
  const [{ t }, beaches] = await Promise.all([getI18n(), getAllSummaries()]);
  const O = t.op;
  const KPI = [
    { n: "5", l: O.kpiMon, s: null, mono: false },
    { n: "3", l: O.kpiRisk, s: "caution", mono: false },
    { n: "1", l: O.kpiUrgent, s: "danger", mono: false },
    { n: "06:00", l: O.kpiUpdated, s: null, mono: true },
  ] as const;

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.secHead}>
        <h3>{O.title}</h3>
        <span>{O.sub}</span>
      </div>

      {/* KPI 행 */}
      <div className={styles.kpiRow}>
        {KPI.map((k, i) => (
          <div key={i} className={styles.kpi}>
            <b
              className={k.s ? styles["s" + k.s.charAt(0).toUpperCase() + k.s.slice(1)] : undefined}
              style={k.mono ? { fontFamily: "var(--mono)", fontSize: 26 } : undefined}
            >
              {k.mono ? k.n : <CountUp value={Number(k.n)} />}
            </b>
            <span>{k.l}</span>
          </div>
        ))}
      </div>

      {/* 실시간 해수욕장 상태 테이블 */}
      <div>
        <div className={styles.secHead}>
          <h3>{O.statusTitle}</h3>
          <span className="mono">{O.statusSub}</span>
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
            <strong>{O.monTitle}</strong>
            <span className="mono">
              <i className={`dot ${styles.livePulse}`} style={{ background: "var(--danger)", display: "inline-block", width: 8, height: 8, borderRadius: "50%", marginRight: 4, "--pulse-color": "var(--danger)" } as React.CSSProperties} />
              LIVE
            </span>
          </div>
          <div className={styles.alertList}>
            {ALERTS.map((a, i) => (
              <div
                key={i}
                className={styles.alertItem}
                style={{ "--si": i } as React.CSSProperties}
              >
                <span
                  className={`${styles.alertBar}${a.level === "danger" ? " " + styles.alertBarPulse : ""}`}
                  style={{ background: SC[a.level] }}
                />
                <div className={styles.alertMain}>
                  <div className={styles.alertTop}>
                    <b>{t.beaches[a.id]}</b>
                    <span
                      className={styles.alertPill}
                      style={{ color: SC[a.level], background: SC[a.level] + "22" }}
                    >
                      {a.level === "danger" ? t.common.danger : t.common.caution}
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
            <strong>{O.deployTitle}</strong>
            <span className="mono">{O.deployRec}</span>
          </div>
          <div className={styles.deployList}>
            {DEPLOY.map((d, i) => (
              <div key={i} className={styles.deployRow}>
                <b>{t.beaches[d.id]}</b>
                <div className={styles.deployBar}>
                  <i
                    className={styles.deployFill}
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
                  {d.now}/{d.need}
                  {O.personUnit}
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
          <strong>{O.noticeTitle}</strong>
          <span className="mono">{O.noticeSub}</span>
        </div>
        <div className={styles.noticeCard}>
          <div className={`${styles.noticeTag} mono`}>
            {O.noticeAuto} · {t.beaches.dadaepo} · 16:00
          </div>
          <Typewriter
            text="안내 말씀드립니다. 현재 다대포 해수욕장 우측 갯골 구간에 이안류 위험이 감지되었습니다. 해당 구간은 조위 상승으로 수심이 빠르게 깊어지고 있으니, 어린이와 초보자는 입수를 자제하시고 안전요원이 지정한 안전구역에서만 물놀이를 즐겨 주시기 바랍니다."
          />
          <div className={styles.noticeActions}>
            <button className={styles.btnPrimary}>{O.broadcast}</button>
            <button className={styles.btnGhost}>{O.board}</button>
            <button className={styles.btnGhost}>{O.regen}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
