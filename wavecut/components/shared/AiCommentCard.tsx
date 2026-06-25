"use client";
import styles from "./crossSection.module.css";

export function AiCommentCard({ beachName, text }: { beachName: string; text: string }) {
  return (
    <div className={styles.aiCard} aria-label={`${beachName} AI 안전 코멘트`}>
      <div className={styles.aiHead}>
        <span className={styles.aiBadge}>AI</span>
        <strong>AI 안전 코멘트</strong>
        <span className={`${styles.aiLive} mono`}><i></i>실시간 해석</span>
      </div>
      <p className={styles.aiBody}>{text}</p>
      <div className={`${styles.aiFoot} mono`}>수심 · 조위 · 파고 · 이안류 데이터를 종합한 추정 결과입니다.</div>
    </div>
  );
}
