import { Icon } from "@/components/shared/Icon";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/mobile/mobile.module.css";

export default async function MypagePage() {
  const { t } = await getI18n();
  const m = t.mobile;
  const menuRows = [
    { icon: "star", label: m.myFav },
    { icon: "doc", label: m.myData },
    { icon: "layers", label: m.myGuide },
    { icon: "alert", label: m.myDisc },
  ] as const;

  return (
    <div className={styles.aHomeContent}>
      {/* 페이지 헤더 */}
      <div className={styles.aHeroTop}>
        <span className={styles.aHelloLabel}>웨이브컷 WaveCut</span>
        <h2>{m.mypage}</h2>
      </div>

      {/* 사용자 정보 카드 */}
      <div className={styles.aMineCard}>
        <span className={styles.aMineAvatar}>
          <Icon name="user" size={22} color="#fff" />
        </span>
        <div>
          <b>{m.myUser}</b>
          <span className={styles.aMineSubLabel}>{m.mySub}</span>
        </div>
      </div>

      {/* 메뉴 리스트 */}
      <div className={styles.aMineList}>
        {menuRows.map((row) => (
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
      <p className={styles.aLegal}>{m.myLegal}</p>
    </div>
  );
}
