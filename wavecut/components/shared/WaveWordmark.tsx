import styles from "./shared.module.css";

export function WaveWordmark({
  light,
  sub = true,
  size = "md",
}: {
  light?: boolean;
  sub?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? styles.wcLg
      : size === "sm"
      ? styles.wcSm
      : styles.wcMd;

  return (
    <div
      className={`${styles.wcLockup} ${sizeClass}${light ? ` ${styles.wcLt}` : ""}`}
    >
      <span className={styles.wcKo}>웨이브컷</span>
      {sub && (
        <span className={styles.wcEn}>
          Wave<b>Cut</b>
        </span>
      )}
    </div>
  );
}
