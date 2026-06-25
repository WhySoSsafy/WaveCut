import type { BeachSummary } from "@/lib/api/aggregate";
import { StatusPill } from "@/components/shared/StatusPill";
import styles from "./web.module.css";

interface OperatorTableProps {
  beaches: BeachSummary[];
}

export function OperatorTable({ beaches }: OperatorTableProps) {
  return (
    <div className={styles.opTable}>
      <table className={styles.opTableEl}>
        <thead>
          <tr>
            <th>해수욕장</th>
            <th>지역</th>
            <th>상태</th>
            <th>안전점수</th>
            <th>날씨</th>
            <th>기온</th>
            <th>자외선</th>
            <th>혼잡도</th>
          </tr>
        </thead>
        <tbody>
          {beaches.map((b) => (
            <tr key={b.id}>
              <td>
                <a href={`/beach/${b.id}`} className={styles.opBeachLink}>
                  {b.name}
                </a>
              </td>
              <td className={styles.opMono}>{b.region}</td>
              <td>
                <StatusPill status={b.status} />
              </td>
              <td className={styles.opScore}>{b.score}</td>
              <td>{b.sky}</td>
              <td className={styles.opMono}>{b.air}℃</td>
              <td>{b.uv}</td>
              <td>{b.crowd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
