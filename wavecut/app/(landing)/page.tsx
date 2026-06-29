import Link from "next/link";
import { LandingHero } from "@/components/landing/LandingHero";
import { Reveal } from "@/components/landing/Reveal";
import { Icon, type IconName } from "@/components/shared/Icon";
import { LEVELS } from "@/lib/bsm/levels";
import { BEACH_IDS } from "@/lib/data/fallback";
import { BeachPhoto } from "@/components/shared/BeachPhoto";
import { getBeachDetail } from "@/lib/api/aggregate";
import { getI18n } from "@/lib/i18n/server";
import styles from "@/components/landing/landing.module.css";

const SOURCES = ["기상청", "국립해양조사원", "해양수산부", "공공데이터포털"];

export default async function LandingPage() {
  const [{ t }, heroBeach] = await Promise.all([
    getI18n(),
    getBeachDetail("haeundae"),
  ]);
  const L = t.landing;

  const features: { icon: IconName; title: string; desc: string }[] = [
    { icon: "layers", title: L.featXsecT, desc: L.featXsecD },
    { icon: "wave", title: L.featDataT, desc: L.featDataD },
    { icon: "transit", title: L.featTransitT, desc: L.featTransitD },
    { icon: "users", title: L.featOperatorT, desc: L.featOperatorD },
  ];

  return (
    <main>
      <LandingHero beach={heroBeach} t={t} />

      {/* 문제 제기 */}
      <section className={styles.sec}>
        <Reveal className={styles.problem}>
          <span className={styles.secKicker}>{L.problemKicker}</span>
          <h2 className={styles.secTitle}>{L.problemTitle}</h2>
          <p className={styles.secLede}>{L.problemLede}</p>
        </Reveal>
      </section>

      {/* 체감 수심 개념 */}
      <section className={styles.secAlt}>
        <Reveal>
          <span className={styles.secKicker}>{L.ideaKicker}</span>
          <h2 className={styles.secTitle}>{L.ideaTitle}</h2>
          <p className={styles.secLede}>{L.ideaLede}</p>
        </Reveal>
        <Reveal className={styles.levelRow}>
          {LEVELS.map((lv) => (
            <div key={lv.key} className={styles.levelChip}>
              <span
                className={styles.levelSwatch}
                style={{ background: lv.cssVar }}
              />
              {t.common.levels[lv.key]}
            </div>
          ))}
        </Reveal>
      </section>

      {/* 핵심 기능 */}
      <section className={styles.sec} id="features">
        <Reveal>
          <span className={styles.secKicker}>{L.featKicker}</span>
          <h2 className={styles.secTitle}>{L.featTitle}</h2>
        </Reveal>
        <div className={styles.featGrid}>
          {features.map((f, i) => (
            <Reveal key={f.title} className={styles.featCard} delay={i * 80}>
              <span className={styles.featIc}>
                <Icon name={f.icon} size={22} color="var(--blue-600)" />
              </span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 실데이터 신뢰 */}
      <section className={styles.secData}>
        <Reveal className={styles.dataInner}>
          <span className={styles.secKicker} style={{ color: "var(--sky-300)" }}>
            {L.dataKicker}
          </span>
          <h2 className={styles.secTitle} style={{ color: "#fff" }}>
            {L.dataTitle}
          </h2>
          <p className={styles.secLede} style={{ color: "#c6d9f0" }}>
            {L.dataLede}
          </p>
          <div className={styles.srcChips}>
            {SOURCES.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* 관광객 — 오는 길 안내 */}
      <section className={styles.secAlt}>
        <Reveal className={styles.tourist}>
          <div>
            <span className={styles.secKicker}>{L.touristKicker}</span>
            <h2 className={styles.secTitle}>{L.touristTitle}</h2>
            <p className={styles.secLede}>{L.touristLede}</p>
            <Link href="/transit" className={styles.touristLink}>
              {L.touristLink}{" "}
              <Icon name="chevron" size={15} color="var(--blue-600)" />
            </Link>
          </div>
          <div className={styles.touristIc} aria-hidden="true">
            <Icon name="transit" size={56} color="var(--blue-600)" />
          </div>
        </Reveal>
      </section>

      {/* 부산 해변 */}
      <section className={styles.sec}>
        <Reveal>
          <span className={styles.secKicker}>{L.beachesKicker}</span>
          <h2 className={styles.secTitle}>{L.beachesTitle}</h2>
        </Reveal>
        <div className={styles.beachGrid}>
          {BEACH_IDS.map((id, i) => (
            <Reveal key={id} delay={i * 70}>
              <Link href={`/beach/${id}`} className={styles.beachCard}>
                <div className={styles.beachImg}>
                  <BeachPhoto
                    id={id}
                    alt={t.beaches[id]}
                    sizes="(max-width: 900px) 50vw, 220px"
                  />
                </div>
                <div className={styles.beachName}>
                  {t.beaches[id]}
                  <Icon name="chevron" size={15} color="var(--ink-3)" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA 푸터 */}
      <section className={styles.cta}>
        <Reveal className={styles.ctaInner}>
          <h2>{L.ctaTitle}</h2>
          <p>{L.ctaSub}</p>
          <Link href="/dashboard" className={styles.ctaBig}>
            {t.common.enter} <span aria-hidden="true">→</span>
          </Link>
          <p className={styles.ctaFine}>{L.ctaFine}</p>
        </Reveal>
      </section>
    </main>
  );
}
