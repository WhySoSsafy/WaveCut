"use client";
import { useT } from "@/lib/i18n/LocaleProvider";
import styles from "./crossSection.module.css";

export function AiCommentCard({ beachName, text }: { beachName: string; text: string }) {
  const Tx = useT().xsec;
  return (
    <div className={styles.aiCard} aria-label={`${beachName} ${Tx.aiTitle}`}>
      <div className={styles.aiHead}>
        <span className={styles.aiBadge}>AI</span>
        <strong>{Tx.aiTitle}</strong>
        <span className={`${styles.aiLive} mono`}><i></i>{Tx.aiLive}</span>
      </div>
      <p className={styles.aiBody}>{text}</p>
      <div className={`${styles.aiFoot} mono`}>{Tx.aiFoot}</div>
    </div>
  );
}
