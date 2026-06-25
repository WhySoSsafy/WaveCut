import { Icon } from "@/components/shared/Icon";
import styles from "@/components/mobile/mobile.module.css";

const MENU_ROWS = [
  { icon: "star",   label: "즐겨찾기 관리" },
  { icon: "doc",    label: "데이터 출처 안내" },
  { icon: "layers", label: "서비스 이용 안내" },
  { icon: "alert",  label: "면책 · 안전 유의사항" },
] as const;

export default function MypagePage() {
  return (
    <div className={styles.aHomeContent}>
      {/* 페이지 헤더 */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>웨이브컷 WaveCut</span>
        <h2>마이페이지</h2>
      </div>

      {/* 사용자 정보 카드 */}
      <div className={styles.aMineCard}>
        <span className={styles.aMineAvatar}>
          <Icon name="user" size={22} color="#fff" />
        </span>
        <div>
          <b>부산 시민</b>
          <span className={styles.aMineSubLabel}>가족 단위 이용자</span>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className={styles.aMineList}>
        {MENU_ROWS.map((row) => (
          <button key={row.label} className={styles.aMineRow}>
            <span className={styles.aMineIc}>
              <Icon name={row.icon} size={17} color="var(--blue-600)" />
            </span>
            <b>{row.label}</b>
            <Icon name="chevron" size={15} color="var(--ink-3)" />
          </button>
        ))}
      </div>

      {/* 면책 문구 */}
      <p className={styles.aLegal}>
        본 서비스의 안전 정보는 공공데이터 기반 AI 추정 결과로 실제와 다를 수
        있습니다.
      </p>
    </div>
  );
}
