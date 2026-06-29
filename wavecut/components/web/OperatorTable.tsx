"use client";

import type { BeachSummary } from "@/lib/api/aggregate";
import type { BeachId } from "@/lib/data/fallback";
import { StatusPill } from "@/components/shared/StatusPill";
import { useT } from "@/lib/i18n/LocaleProvider";
import { tv } from "@/lib/i18n/values";
import styles from "./web.module.css";

interface OperatorTableProps {
  beaches: BeachSummary[];
}

export function OperatorTable({ beaches }: OperatorTableProps) {
  const t = useT();
  return (
    <div className={styles.opTable}>
      <table className={styles.opTableEl}>
        <thead>
          <tr>
            <th>{t.op.colBeach}</th>
            <th>{t.card.region}</th>
            <th>{t.op.colStatus}</th>
            <th>{t.op.colScore}</th>
            <th>{t.card.weather}</th>
            <th>{t.op.colTemp}</th>
            <th>{t.card.uv}</th>
            <th>{t.card.crowd}</th>
          </tr>
        </thead>
        <tbody>
          {beaches.map((b) => (
            <tr key={b.id}>
              <td>
                <a href={`/beach/${b.id}`} className={styles.opBeachLink}>
                  {t.beaches[b.id as BeachId]}
                </a>
              </td>
              <td className={styles.opMono}>{b.region}</td>
              <td>
                <StatusPill status={b.status} />
              </td>
              <td className={styles.opScore}>{b.score}</td>
              <td>{tv(t, "sky", b.sky)}</td>
              <td className={styles.opMono}>{b.air}℃</td>
              <td>{tv(t, "uv", b.uv)}</td>
              <td>{tv(t, "crowd", b.crowd)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
