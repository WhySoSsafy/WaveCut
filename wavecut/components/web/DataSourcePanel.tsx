import styles from "./web.module.css";

const DATA_SOURCES = [
  { tag: "수심", name: "국립해양조사원 수심정보", use: "단면 수심도 생성" },
  { tag: "조위", name: "국립해양조사원 조위관측소", use: "체감 수심 보정·예측" },
  { tag: "파고", name: "기상청 파랑 예보", use: "물놀이 위험도 판단" },
  { tag: "이안류", name: "해양경찰청 이안류 지수", use: "위험 구간 강조" },
  { tag: "날씨", name: "기상청 동네예보", use: "수온·기상 안내" },
];

export function DataSourcePanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelH}>
        <strong>공공데이터 출처</strong>
        <span className="mono">매일 06:00</span>
      </div>
      <div className={styles.srcList}>
        {DATA_SOURCES.map((s) => (
          <div key={s.tag} className={styles.srcItem}>
            <span className={`${styles.srcTag} mono`}>{s.tag}</span>
            <div>
              <b>{s.name}</b>
              <span>{s.use}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
