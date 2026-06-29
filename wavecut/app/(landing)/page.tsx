import Link from "next/link";
import { LandingHero } from "@/components/landing/LandingHero";
import { Reveal } from "@/components/landing/Reveal";
import { Icon, type IconName } from "@/components/shared/Icon";
import { LEVELS } from "@/lib/bsm/levels";
import { BEACH_IDS, FALLBACK } from "@/lib/data/fallback";
import { BeachPhoto } from "@/components/shared/BeachPhoto";
import { getBeachDetail } from "@/lib/api/aggregate";
import styles from "@/components/landing/landing.module.css";

const FEATURES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "layers",
    title: "단면 수심 뷰",
    desc: "해변 평면에서 단면선을 드래그하면 위치별 체감 수심과 급경사·위험 구간을 한눈에.",
  },
  {
    icon: "wave",
    title: "실시간 해양 데이터",
    desc: "기상청·국립해양조사원 공공데이터로 파고·수온·조위·날씨를 실시간 반영.",
  },
  {
    icon: "transit",
    title: "교통·접근성",
    desc: "가장 가까운 역·추천 출구·교통약자 엘리베이터까지, 현장 가는 길을 안내.",
  },
  {
    icon: "users",
    title: "운영자 대시보드",
    desc: "위험 구간 모니터링과 안전요원 배치 참고, AI 안내문 초안 자동 생성.",
  },
];

const SOURCES = ["기상청", "국립해양조사원", "해양수산부", "공공데이터포털"];

export default async function LandingPage() {
  const heroBeach = await getBeachDetail("haeundae");
  return (
    <main>
      <LandingHero beach={heroBeach} />

      {/* 문제 제기 */}
      <section className={styles.sec}>
        <Reveal className={styles.problem}>
          <span className={styles.secKicker}>왜 필요할까요</span>
          <h2 className={styles.secTitle}>
            평온해 보이는 바다도, 몇 걸음이면 위험해집니다.
          </h2>
          <p className={styles.secLede}>
            해운대의 완만한 모래사장도 특정 구간에선 급경사로 수심이 빠르게
            깊어지고, 이안류는 어른도 순식간에 먼바다로 끌고 갑니다. WaveCut은 그
            보이지 않는 위험을 <b>눈에 보이게</b> 만듭니다.
          </p>
        </Reveal>
      </section>

      {/* 체감 수심 개념 */}
      <section className={styles.secAlt}>
        <Reveal>
          <span className={styles.secKicker}>핵심 아이디어</span>
          <h2 className={styles.secTitle}>
            수심을 숫자가 아닌 <span className={styles.hl}>체감 단계</span>로.
          </h2>
          <p className={styles.secLede}>
            “1.2m”는 와닿지 않지만 “가슴까지”는 누구나 압니다. 6단계로 위험을
            직관적으로.
          </p>
        </Reveal>
        <Reveal className={styles.levelRow}>
          {LEVELS.map((lv) => (
            <div key={lv.key} className={styles.levelChip}>
              <span
                className={styles.levelSwatch}
                style={{ background: lv.cssVar }}
              />
              {lv.label}
            </div>
          ))}
        </Reveal>
      </section>

      {/* 핵심 기능 */}
      <section className={styles.sec} id="features">
        <Reveal>
          <span className={styles.secKicker}>무엇을 할 수 있나요</span>
          <h2 className={styles.secTitle}>해변 안전을 위한 네 가지 도구</h2>
        </Reveal>
        <div className={styles.featGrid}>
          {FEATURES.map((f, i) => (
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
            추정이 아닌 실데이터
          </span>
          <h2 className={styles.secTitle} style={{ color: "#fff" }}>
            공공데이터를 실시간으로 연동했습니다.
          </h2>
          <p className={styles.secLede} style={{ color: "#c6d9f0" }}>
            파고·수온·조위·날씨는 기상청과 국립해양조사원의 공식 API에서
            실시간으로 가져옵니다. 데모용 가짜 숫자가 아닙니다.
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
            <span className={styles.secKicker}>부산이 처음이세요?</span>
            <h2 className={styles.secTitle}>오는 길까지 해변별로 안내합니다.</h2>
            <p className={styles.secLede}>
              가장 가까운 지하철역·추천 출구·교통약자 엘리베이터, 그리고 카카오·네이버
              지도 길찾기까지. 관광객도 부산 해변을 쉽게 찾아갈 수 있어요.
            </p>
            <Link href="/transit" className={styles.touristLink}>
              교통·접근성 보기{" "}
              <Icon name="chevron" size={15} color="var(--blue-600)" />
            </Link>
          </div>
          <div className={styles.touristIc} aria-hidden="true">
            <Icon name="transit" size={56} color="var(--blue-600)" />
          </div>
        </Reveal>
      </section>

      {/* 부산 6개 해변 */}
      <section className={styles.sec}>
        <Reveal>
          <span className={styles.secKicker}>어디를 볼 수 있나요</span>
          <h2 className={styles.secTitle}>부산 6개 해수욕장</h2>
        </Reveal>
        <div className={styles.beachGrid}>
          {BEACH_IDS.map((id, i) => (
            <Reveal key={id} delay={i * 70}>
              <Link href={`/beach/${id}`} className={styles.beachCard}>
                <div className={styles.beachImg}>
                  <BeachPhoto
                    id={id}
                    alt={FALLBACK[id].name}
                    sizes="(max-width: 900px) 50vw, 220px"
                  />
                </div>
                <div className={styles.beachName}>
                  {FALLBACK[id].name}
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
          <h2>지금 우리 동네 해변을 확인하세요</h2>
          <p>부산 해수욕장의 체감 수심과 안전 등급을 한눈에.</p>
          <Link href="/dashboard" className={styles.ctaBig}>
            서비스 들어가기 <span aria-hidden="true">→</span>
          </Link>
          <p className={styles.ctaFine}>
            부산시 공공데이터 AI 활용 경진대회 출품작 · 데이터: 기상청 ·
            국립해양조사원
          </p>
        </Reveal>
      </section>
    </main>
  );
}
