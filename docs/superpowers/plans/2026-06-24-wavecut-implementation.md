# WaveCut 웨이브컷 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 부산 5개 해수욕장의 공공 데이터(수심·조위·파고·이안류·날씨·수질)를 결합해 단면 수심 뷰와 안전 정보를 제공하는 Next.js 웹/모바일 서비스를 구현하고 Vercel에 배포한다.

**Architecture:** Next.js 15 App Router. 페이지는 Server Component에서 `lib/api/*`로 공공 API를 직접 호출하고 `lib/bsm/*` 엔진으로 가공한 뒤 props로 내려준다. 단면 수심 뷰(`CrossSection`)만 Client Component로 격리해 드래그·시간대 전환을 순수 계산으로 처리한다. 공공 API 키는 서버에만 존재하며, 실패 시 하드코딩 fallback으로 대체한다.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS Modules + CSS Variables, Vitest (단위 테스트), Vercel (배포).

## Global Constraints

- **언어/런타임:** TypeScript strict 모드. Node 20+.
- **정보 위계 (절대 준수):** 카드/홈에는 해수욕장명·날씨·기온·자외선·혼잡도·안전배지만 노출. 카드에 파고/조위/이안류/가족추천 노출 금지. 파고/조위/이안류/가족추천은 상세 화면에서만. AI 코멘트·상황별 권장 행동은 단면 뷰 하단에만.
- **API 키 보호:** 공공 API는 반드시 서버(Server Component 또는 Route Handler)에서만 호출. 클라이언트 번들에 키가 포함되면 안 됨. 키는 `process.env.*`로만 접근.
- **AI 코멘트:** 규칙 기반만. LLM 호출 없음.
- **표현 가이드:** "정확한 측정"이 아니라 "추정·시각화" 표현 사용.
- **디자인 토큰:** `design_files/styles.css`의 값을 그대로 이식. 색상 hex 변경 금지.
- **5개 해변 고정:** haeundae, gwangalli, songjeong, songdo, dadaepo. GPS/내 위치 기능 없음.
- **단면도 기하 상수 (그대로 이식):** `VB_W=820`, `VB_H=compact?300:340`, `X0=56`, `X1=VB_W-18`, `D_MIN=-12`, `D_MAX=80`, `SURFACE_Y=64`, `SCALE=(VB_H-34-SURFACE_Y)/2.4`.
- **체감 수심 임계 (조위0 기준, m):** none≤0.02, ankle≥0, knee≥0.3, waist≥0.6, chest≥1.0, head≥1.5.
- **조위 시뮬레이션:** now/t1/t2 3단계. 오프셋은 조위 API 예보값으로 계산 (fallback: 0.0/0.35/0.70m).

---

## File Structure

```
wavecut/                          # Next.js 프로젝트 루트
├── app/
│   ├── layout.tsx                # 루트 레이아웃 (폰트, 글로벌 CSS)
│   ├── (web)/
│   │   ├── layout.tsx            # 사이드바 셸
│   │   ├── page.tsx              # / 대시보드
│   │   ├── beach/[id]/page.tsx   # 웹 상세
│   │   ├── beach/[id]/xsec/page.tsx
│   │   └── operator/page.tsx
│   ├── (mobile)/
│   │   ├── layout.tsx            # 하단 탭 셸
│   │   └── app/
│   │       ├── page.tsx          # /app 홈
│   │       ├── favorites/page.tsx
│   │       ├── mypage/page.tsx
│   │       └── beach/[id]/
│   │           ├── page.tsx
│   │           └── xsec/page.tsx
│   └── api/
│       ├── beaches/route.ts      # 전체 해변 요약 (가공 완료본)
│       └── beach/[id]/route.ts   # 단일 해변 상세 (가공 완료본)
├── lib/
│   ├── bsm/
│   │   ├── types.ts
│   │   ├── levels.ts             # LEVELS, levelOf
│   │   ├── profile.ts            # BedProfile, fromTransect, fromGrid, depthAt, analyze
│   │   ├── aiComment.ts          # aiComment, situationTips
│   │   └── score.ts              # computeScore, statusOf
│   ├── api/
│   │   ├── env.ts                # 환경변수 접근 + 검증
│   │   ├── stations.ts           # 해변→관측소/격자 코드 매핑
│   │   ├── tide.ts               # fetchTide
│   │   ├── weather.ts            # fetchWeather
│   │   ├── beachInfo.ts          # fetchBeachInfo (파고/수온/풍속)
│   │   ├── rip.ts                # fetchRip
│   │   ├── wave.ts               # fetchWave
│   │   ├── quality.ts            # fetchQuality
│   │   ├── bathymetry.ts         # fetchBathymetry (격자 수심)
│   │   └── aggregate.ts          # getBeachSummary, getBeachDetail (조합)
│   └── data/
│       ├── fallback.ts           # 하드코딩 fallback (data.js 이식)
│       └── coastline/            # 정적 GeoJSON (해안선)
├── components/
│   ├── shared/
│   │   ├── StatusPill.tsx
│   │   ├── Icon.tsx
│   │   ├── Stat.tsx
│   │   ├── ScoreGauge.tsx
│   │   ├── BeachCard.tsx
│   │   ├── WaveLogo.tsx
│   │   ├── WaveWordmark.tsx
│   │   ├── CrossSection.tsx      # Client Component (핵심)
│   │   ├── DepthLegend.tsx
│   │   └── AiCommentCard.tsx
│   ├── web/ ...
│   └── mobile/ ...
├── styles/
│   ├── tokens.css                # 디자인 토큰 (styles.css 이식)
│   └── globals.css
├── test/
│   └── bsm/ ...                  # Vitest 단위 테스트
├── vitest.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase 0: Foundation

### Task 0.1: Next.js 프로젝트 스캐폴드 + 디자인 토큰

**Files:**
- Create: `wavecut/package.json`, `wavecut/tsconfig.json`, `wavecut/next.config.ts`, `wavecut/vitest.config.ts`
- Create: `wavecut/app/layout.tsx`, `wavecut/styles/tokens.css`, `wavecut/styles/globals.css`
- Create: `wavecut/app/page.tsx` (임시 플레이스홀더)

**Interfaces:**
- Produces: 빌드 가능한 Next.js 앱. `npm run dev`로 기동. `npm run test`로 Vitest 실행.

- [ ] **Step 1: 프로젝트 생성**

작업 디렉토리는 `c:\Users\SSAFY\Desktop\design_handoff_wavecut\wavecut` 로 한다.

```bash
cd "c:/Users/SSAFY/Desktop/design_handoff_wavecut"
npx create-next-app@latest wavecut --typescript --app --no-tailwind --no-src-dir --import-alias "@/*" --eslint
```

프롬프트에서 Turbopack은 기본값(Yes) 수락.

- [ ] **Step 2: Vitest 설치 및 설정**

```bash
cd wavecut
npm install -D vitest @vitest/coverage-v8
```

`wavecut/vitest.config.ts` 작성:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

`wavecut/package.json`의 `scripts`에 추가:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: 디자인 토큰 이식**

`wavecut/styles/tokens.css` 작성 — `design_files/styles.css`의 `:root{...}` 블록(3–43행)과 status helper, mono 클래스(55–63행)를 그대로 복사. 단 `@import` 폰트 줄(1행, 44행)은 `app/layout.tsx`에서 `next/font`로 처리하므로 제외.

```css
:root{
  --navy-900:#0A2342; --navy-800:#0E2C53; --navy-700:#143a6b;
  --blue-700:#1554b8; --blue-600:#1D6FE0; --blue-500:#2f86f0;
  --sky-400:#39B7F0; --sky-300:#7DD3FC; --sky-100:#E1F1FB; --sky-50:#F0F8FE;
  --safe:#16A34A; --safe-bg:#E7F6EC; --safe-line:#bfe6cb;
  --caution:#EA8C00; --caution-bg:#FDF1DD; --caution-line:#f6d9a6;
  --danger:#DC2626; --danger-bg:#FCE9E9; --danger-line:#f3c0c0;
  --d-none:#EAF4FB; --d-ankle:#BFE3F6; --d-knee:#7FC6EE;
  --d-waist:#3D9FE0; --d-chest:#EA8C00; --d-head:#DC2626;
  --ink:#0F2238; --ink-2:#3D5573; --ink-3:#6B819B;
  --line:#E2E9F1; --line-2:#EEF3F8; --bg:#F4F7FB; --card:#FFFFFF;
  --r-lg:18px; --r-md:14px; --r-sm:10px;
  --shadow-sm:0 1px 2px rgba(14,44,83,.06), 0 1px 3px rgba(14,44,83,.05);
  --shadow-md:0 4px 16px rgba(14,44,83,.08);
  --shadow-lg:0 18px 50px rgba(10,35,66,.16);
  --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
}
*{box-sizing:border-box;}
.mono{font-family:var(--mono);letter-spacing:0;}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block;}
.bg-safe{background:var(--safe);} .bg-caution{background:var(--caution);} .bg-danger{background:var(--danger);}
```

`wavecut/styles/globals.css`:

```css
@import "./tokens.css";
html,body{margin:0;padding:0;}
body{
  font-family:var(--font-pretendard),system-ui,sans-serif;
  color:var(--ink); background:var(--bg);
  -webkit-font-smoothing:antialiased; letter-spacing:-0.01em;
}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
:focus-visible{outline:2px solid var(--blue-500);outline-offset:2px;}
```

- [ ] **Step 4: 루트 레이아웃 + 폰트**

```bash
npm install pretendard
```

`wavecut/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Quicksand } from "next/font/google";
import "@/styles/globals.css";

const pretendard = localFont({
  src: "../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});
const quicksand = Quicksand({
  subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "웨이브컷 WaveCut — 해수욕장 안전 서비스",
  description: "부산 해수욕장 단면 수심·안전 정보",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${quicksand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

`wavecut/app/page.tsx`를 임시 플레이스홀더로 교체:

```tsx
export default function Home() {
  return <main style={{ padding: 24 }}>WaveCut — 준비 중</main>;
}
```

- [ ] **Step 5: 빌드 검증**

Run: `npm run dev` → 브라우저에서 `http://localhost:3000` 접속
Expected: "WaveCut — 준비 중" 표시, 콘솔 에러 없음. 확인 후 종료.

Run: `npm run test`
Expected: "No test files found" 경고만 (아직 테스트 없음). 종료 코드 정상.

- [ ] **Step 6: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js app with design tokens and fonts"
```

---

## Phase 1: BSM Engine (순수 로직, TDD)

이 페이즈는 공공 API와 무관한 순수 계산 로직이다. 전부 단위 테스트로 검증한다.

### Task 1.1: 타입 정의 + 체감 수심 단계

**Files:**
- Create: `wavecut/lib/bsm/types.ts`
- Create: `wavecut/lib/bsm/levels.ts`
- Test: `wavecut/test/bsm/levels.test.ts`

**Interfaces:**
- Produces:
  - `type SafetyStatus = "safe" | "caution" | "danger"`
  - `type TideKey = "now" | "t1" | "t2"`
  - `interface DepthLevel { key: string; label: string; status: SafetyStatus; cssVar: string }`
  - `function levelOf(depth: number): DepthLevel`
  - `const LEVELS: DepthLevel[]`

- [ ] **Step 1: 타입 파일 작성**

`wavecut/lib/bsm/types.ts`:

```ts
export type SafetyStatus = "safe" | "caution" | "danger";
export type TideKey = "now" | "t1" | "t2";

export interface DepthLevel {
  key: "none" | "ankle" | "knee" | "waist" | "chest" | "head";
  label: string;
  status: SafetyStatus;
  cssVar: string; // 예: "var(--d-knee)"
  min: number;    // 임계 깊이(m)
}
```

- [ ] **Step 2: 실패하는 테스트 작성**

`wavecut/test/bsm/levels.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { levelOf } from "@/lib/bsm/levels";

describe("levelOf", () => {
  it("0.02m 이하는 물 없음", () => {
    expect(levelOf(0).key).toBe("none");
    expect(levelOf(0.02).key).toBe("none");
  });
  it("0.1m는 발목", () => { expect(levelOf(0.1).key).toBe("ankle"); });
  it("0.3m는 무릎", () => { expect(levelOf(0.3).key).toBe("knee"); });
  it("0.6m는 허리(주의)", () => {
    expect(levelOf(0.6).key).toBe("waist");
    expect(levelOf(0.6).status).toBe("caution");
  });
  it("1.0m는 가슴", () => { expect(levelOf(1.0).key).toBe("chest"); });
  it("1.5m 이상은 머리(위험)", () => {
    expect(levelOf(1.5).key).toBe("head");
    expect(levelOf(2.0).status).toBe("danger");
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npx vitest run test/bsm/levels.test.ts`
Expected: FAIL — "Cannot find module '@/lib/bsm/levels'"

- [ ] **Step 4: 구현**

`wavecut/lib/bsm/levels.ts`:

```ts
import type { DepthLevel } from "./types";

export const LEVELS: DepthLevel[] = [
  { key: "none",  label: "물 없음",   status: "safe",    cssVar: "var(--d-none)",  min: -99 },
  { key: "ankle", label: "발목",      status: "safe",    cssVar: "var(--d-ankle)", min: 0   },
  { key: "knee",  label: "무릎",      status: "safe",    cssVar: "var(--d-knee)",  min: 0.3 },
  { key: "waist", label: "허리",      status: "caution", cssVar: "var(--d-waist)", min: 0.6 },
  { key: "chest", label: "가슴",      status: "caution", cssVar: "var(--d-chest)", min: 1.0 },
  { key: "head",  label: "머리 이상", status: "danger",  cssVar: "var(--d-head)",  min: 1.5 },
];

export function levelOf(depth: number): DepthLevel {
  if (depth <= 0.02) return LEVELS[0];
  let result = LEVELS[1];
  for (const lv of LEVELS) if (depth >= lv.min) result = lv;
  return result;
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run test/bsm/levels.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 6: Commit**

```bash
git add lib/bsm/types.ts lib/bsm/levels.ts test/bsm/levels.test.ts
git commit -m "feat: add depth level classification (levelOf)"
```

### Task 1.2: 해저 프로파일 + 체감 수심 + 경계 분석

`data.js`의 `bedDepth`/`transectAt`/`depthAt`/`analyze`를 이식하되, 실데이터 격자도 받을 수 있도록 `BedProfile = (d: number) => number` 추상화로 통합한다.

**Files:**
- Create: `wavecut/lib/bsm/profile.ts`
- Test: `wavecut/test/bsm/profile.test.ts`

**Interfaces:**
- Consumes: `levelOf` (Task 1.1)
- Produces:
  - `interface TransectParams { shelf: number; shelfDepth: number; slope: number; rip: boolean }`
  - `interface GridSample { dist: number; depth: number }` — 해안선 거리(m)별 조위0 기준 수심(m)
  - `type BedProfile = (dist: number) => number` — 거리→조위0 수심(m)
  - `function profileFromTransect(t: TransectParams): BedProfile`
  - `function profileFromGrid(samples: GridSample[]): BedProfile`
  - `function lerpTransect(a, b, f): TransectParams`
  - `function transectAt(transects: TransectParams[], p: number): TransectParams`
  - `function depthAt(profile: BedProfile, tideOffset: number, dist: number): number`
  - `interface AnalyzeResult { kneeEnd: number; dangerStart: number | null }`
  - `function analyze(profile: BedProfile, tideOffset: number): AnalyzeResult`

- [ ] **Step 1: 실패하는 테스트 작성**

`wavecut/test/bsm/profile.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  profileFromTransect, profileFromGrid, transectAt, depthAt, analyze,
  type TransectParams,
} from "@/lib/bsm/profile";

const HAEUNDAE_CENTER: TransectParams = { shelf: 42, shelfDepth: 0.75, slope: 0.05, rip: false };

describe("profileFromTransect", () => {
  const bed = profileFromTransect(HAEUNDAE_CENTER);
  it("마른 모래사장(음수 거리)은 음수 깊이", () => {
    expect(bed(-14)).toBeCloseTo(-0.5, 5);
  });
  it("해안선(0m)은 0", () => { expect(bed(0)).toBeCloseTo(0, 5); });
  it("모래턱 끝(42m)은 shelfDepth", () => { expect(bed(42)).toBeCloseTo(0.75, 5); });
  it("모래턱 이후 급경사", () => {
    expect(bed(62)).toBeCloseTo(0.75 + 20 * 0.05, 5); // 1.75
  });
});

describe("profileFromGrid (선형 보간)", () => {
  const bed = profileFromGrid([
    { dist: 0, depth: 0 }, { dist: 20, depth: 1.0 }, { dist: 40, depth: 2.0 },
  ]);
  it("격자점은 정확히 일치", () => { expect(bed(20)).toBeCloseTo(1.0, 5); });
  it("격자 사이는 선형 보간", () => { expect(bed(10)).toBeCloseTo(0.5, 5); });
  it("범위 밖은 가장자리 클램프", () => {
    expect(bed(-5)).toBeCloseTo(0, 5);
    expect(bed(100)).toBeCloseTo(2.0, 5);
  });
});

describe("depthAt (조위 가산)", () => {
  const bed = profileFromTransect(HAEUNDAE_CENTER);
  it("조위 0.35m를 더한다", () => {
    expect(depthAt(bed, 0.35, 0)).toBeCloseTo(0.35, 5);
  });
});

describe("analyze", () => {
  const bed = profileFromTransect({ shelf: 20, shelfDepth: 0.6, slope: 0.2, rip: false });
  it("무릎끝(>0.6)과 위험시작(>=1.5) 거리를 찾는다", () => {
    const r = analyze(bed, 0);
    expect(r.kneeEnd).toBeGreaterThan(0);
    expect(r.dangerStart).not.toBeNull();
    expect(r.dangerStart!).toBeGreaterThan(r.kneeEnd);
  });
  it("위험 구간이 없으면 dangerStart는 null", () => {
    const flat = profileFromTransect({ shelf: 80, shelfDepth: 0.5, slope: 0.001, rip: false });
    expect(analyze(flat, 0).dangerStart).toBeNull();
  });
});

describe("transectAt (위치 보간)", () => {
  const ts: TransectParams[] = [
    { shelf: 20, shelfDepth: 0.7, slope: 0.06, rip: false },
    { shelf: 40, shelfDepth: 0.8, slope: 0.05, rip: false },
    { shelf: 20, shelfDepth: 0.9, slope: 0.10, rip: true },
  ];
  it("p=0은 첫 transect", () => { expect(transectAt(ts, 0).shelf).toBeCloseTo(20, 5); });
  it("p=1은 마지막 transect", () => { expect(transectAt(ts, 1).shelf).toBeCloseTo(20, 5); });
  it("p=0.25는 0번과 1번 사이 보간", () => {
    expect(transectAt(ts, 0.25).shelf).toBeCloseTo(30, 5); // 20 + (40-20)*0.5
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run test/bsm/profile.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

`wavecut/lib/bsm/profile.ts`:

```ts
export interface TransectParams { shelf: number; shelfDepth: number; slope: number; rip: boolean }
export interface GridSample { dist: number; depth: number }
export type BedProfile = (dist: number) => number;
export interface AnalyzeResult { kneeEnd: number; dangerStart: number | null }

// data.js bedDepth 이식: 거리 d(m, 음수=마른 모래사장)의 조위0 깊이
export function profileFromTransect(t: TransectParams): BedProfile {
  return (d: number) => {
    if (d < 0) return (d / 14) * 0.5;
    if (d <= t.shelf) return (d / t.shelf) * t.shelfDepth;
    return t.shelfDepth + (d - t.shelf) * t.slope;
  };
}

// 실데이터 격자: dist 오름차순 samples를 선형 보간, 범위 밖은 가장자리 클램프
export function profileFromGrid(samples: GridSample[]): BedProfile {
  const sorted = [...samples].sort((a, b) => a.dist - b.dist);
  return (d: number) => {
    if (d <= sorted[0].dist) return sorted[0].depth;
    const last = sorted[sorted.length - 1];
    if (d >= last.dist) return last.depth;
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i], b = sorted[i + 1];
      if (d >= a.dist && d <= b.dist) {
        const f = (d - a.dist) / (b.dist - a.dist);
        return a.depth + (b.depth - a.depth) * f;
      }
    }
    return last.depth;
  };
}

export function lerpTransect(a: TransectParams, b: TransectParams, f: number): TransectParams {
  return {
    shelf: a.shelf + (b.shelf - a.shelf) * f,
    shelfDepth: a.shelfDepth + (b.shelfDepth - a.shelfDepth) * f,
    slope: a.slope + (b.slope - a.slope) * f,
    rip: f < 0.5 ? a.rip : b.rip,
  };
}

export function transectAt(transects: TransectParams[], p: number): TransectParams {
  const x = p * (transects.length - 1);
  const i = Math.min(Math.floor(x), transects.length - 2);
  return lerpTransect(transects[i], transects[i + 1], x - i);
}

export function depthAt(profile: BedProfile, tideOffset: number, dist: number): number {
  return profile(dist) + tideOffset;
}

// data.js analyze 이식: 해안선에서 무릎끝(>0.6)·위험시작(>=1.5) 거리
export function analyze(profile: BedProfile, tideOffset: number): AnalyzeResult {
  let kneeEnd: number | null = null;
  let dangerStart: number | null = null;
  for (let d = 0; d <= 80; d += 0.5) {
    const dep = depthAt(profile, tideOffset, d);
    if (kneeEnd === null && dep > 0.6) kneeEnd = d;
    if (dangerStart === null && dep >= 1.5) { dangerStart = d; break; }
  }
  return {
    kneeEnd: kneeEnd === null ? 80 : Math.round(kneeEnd),
    dangerStart: dangerStart === null ? null : Math.round(dangerStart),
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run test/bsm/profile.test.ts`
Expected: PASS (전체 통과)

- [ ] **Step 5: Commit**

```bash
git add lib/bsm/profile.ts test/bsm/profile.test.ts
git commit -m "feat: add bed profile interpolation and shoreline analysis"
```

### Task 1.3: AI 코멘트 + 상황별 권장 행동

**Files:**
- Create: `wavecut/lib/bsm/aiComment.ts`
- Test: `wavecut/test/bsm/aiComment.test.ts`

**Interfaces:**
- Consumes: `AnalyzeResult` (Task 1.2)
- Produces:
  - `function positionName(p: number): "좌측" | "중앙" | "우측"`
  - `function aiComment(a: AnalyzeResult, p: number): string`
  - `interface SituationTip { key: string; icon: string; status: SafetyStatus; title: string; desc: string }`
  - `function situationTips(a: AnalyzeResult, opts: { family: boolean; crowd: string }): SituationTip[]`

- [ ] **Step 1: 실패하는 테스트 작성**

`wavecut/test/bsm/aiComment.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { positionName, aiComment, situationTips } from "@/lib/bsm/aiComment";

describe("positionName", () => {
  it("p<0.34는 좌측", () => expect(positionName(0.2)).toBe("좌측"));
  it("0.34~0.67는 중앙", () => expect(positionName(0.5)).toBe("중앙"));
  it("p>=0.67는 우측", () => expect(positionName(0.8)).toBe("우측"));
});

describe("aiComment", () => {
  it("위험 구간이 있으면 급경사 주의 문구 포함", () => {
    const text = aiComment({ kneeEnd: 30, dangerStart: 45 }, 0.5);
    expect(text).toContain("중앙");
    expect(text).toContain("30m");
    expect(text).toContain("45m");
    expect(text).toContain("주의");
  });
  it("위험 구간이 없으면 급격한 변화 없음 문구", () => {
    const text = aiComment({ kneeEnd: 80, dangerStart: null }, 0.5);
    expect(text).toContain("급격한 수심 변화는 확인되지 않습니다");
  });
});

describe("situationTips", () => {
  it("4개 카드를 반환한다", () => {
    const tips = situationTips({ kneeEnd: 30, dangerStart: 45 }, { family: true, crowd: "보통" });
    expect(tips).toHaveLength(4);
    expect(tips.map((t) => t.key)).toEqual(["family", "begin", "after", "crowd"]);
  });
  it("혼잡도가 많으면 혼잡 카드가 caution", () => {
    const tips = situationTips({ kneeEnd: 30, dangerStart: null }, { family: true, crowd: "많음" });
    expect(tips.find((t) => t.key === "crowd")!.status).toBe("caution");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run test/bsm/aiComment.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

`wavecut/lib/bsm/aiComment.ts` (data.js의 aiComment/situationTips 이식):

```ts
import type { AnalyzeResult } from "./profile";
import type { SafetyStatus } from "./types";

export function positionName(p: number): "좌측" | "중앙" | "우측" {
  return p < 0.34 ? "좌측" : p < 0.67 ? "중앙" : "우측";
}

export function aiComment(a: AnalyzeResult, p: number): string {
  const pos = positionName(p);
  let body = `현재 선택한 ${pos} 단면은 해안선에서 약 ${a.kneeEnd}m까지 무릎 수심으로 가족 이용에 적합합니다.`;
  if (a.dangerStart) {
    body += ` ${a.dangerStart}m 이후부터 수심이 빠르게 깊어지므로 어린이와 초보자는 주의가 필요합니다.`;
  } else {
    body += ` 측정 구간 전반에서 급격한 수심 변화는 확인되지 않습니다.`;
  }
  return body;
}

export interface SituationTip {
  key: "family" | "begin" | "after" | "crowd";
  icon: string;
  status: SafetyStatus;
  title: string;
  desc: string;
}

export function situationTips(
  a: AnalyzeResult,
  opts: { family: boolean; crowd: string }
): SituationTip[] {
  const danger = a.dangerStart;
  return [
    {
      key: "family", icon: "family", status: opts.family ? "safe" : "caution", title: "가족 동반",
      desc: `해안선 ${a.kneeEnd}m까지 무릎 이하 수심입니다. 어린이는 이 구간 안에서 보호자와 함께 물놀이하세요.`,
    },
    {
      key: "begin", icon: "wave", status: danger ? "caution" : "safe", title: "수영 초보자",
      desc: danger
        ? `${danger}m 이후부터 수심이 빠르게 깊어집니다. 구명조끼를 착용하고 안전선 안쪽을 이용하세요.`
        : `급격한 수심 변화는 없지만 입수 시 항상 안전선 안쪽에 머물러주세요.`,
    },
    {
      key: "after", icon: "tide", status: "caution", title: "오후 방문 예정",
      desc: `오후로 갈수록 조위가 상승해 같은 위치의 체감 수심이 한 단계 깊어집니다. 16시 이후에는 수심을 다시 확인하세요.`,
    },
    {
      key: "crowd", icon: "crowd", status: opts.crowd === "많음" ? "caution" : "safe", title: "혼잡 시간 방문",
      desc: opts.crowd === "많음"
        ? `현재 혼잡도가 높습니다. 일행과 떨어지지 않도록 하고 안전요원의 안내 구역을 확인하세요.`
        : `혼잡도가 높지 않아 여유롭게 이용할 수 있습니다.`,
    },
  ];
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run test/bsm/aiComment.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/bsm/aiComment.ts test/bsm/aiComment.test.ts
git commit -m "feat: add rule-based AI comment and situation tips"
```

### Task 1.4: 안전 점수 계산

**Files:**
- Create: `wavecut/lib/bsm/score.ts`
- Test: `wavecut/test/bsm/score.test.ts`

**Interfaces:**
- Consumes: `SafetyStatus` (Task 1.1)
- Produces:
  - `interface ScoreInput { dangerStart: number | null; rip: "관심"|"주의"|"경계"|"위험"|"안전"; waveHeight: number; tideRising: boolean; windSpeed: number; quality: "적합"|"주의"|"부적합" }`
  - `function computeScore(input: ScoreInput): number` — 0~100 정수
  - `function statusOf(score: number): SafetyStatus`

- [ ] **Step 1: 실패하는 테스트 작성**

`wavecut/test/bsm/score.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeScore, statusOf, type ScoreInput } from "@/lib/bsm/score";

const GOOD: ScoreInput = {
  dangerStart: null, rip: "안전", waveHeight: 0.4, tideRising: false, windSpeed: 2, quality: "적합",
};

describe("computeScore", () => {
  it("이상적 조건은 90점 이상", () => {
    expect(computeScore(GOOD)).toBeGreaterThanOrEqual(90);
  });
  it("이안류 위험은 점수를 크게 낮춘다", () => {
    expect(computeScore({ ...GOOD, rip: "위험" })).toBeLessThan(computeScore(GOOD));
  });
  it("파고가 높으면 점수가 낮아진다", () => {
    expect(computeScore({ ...GOOD, waveHeight: 2.0 })).toBeLessThan(computeScore(GOOD));
  });
  it("0~100 범위로 클램프된다", () => {
    const worst: ScoreInput = {
      dangerStart: 5, rip: "위험", waveHeight: 3, tideRising: true, windSpeed: 20, quality: "부적합",
    };
    const s = computeScore(worst);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
});

describe("statusOf", () => {
  it(">=70 safe", () => expect(statusOf(86)).toBe("safe"));
  it(">=40 caution", () => expect(statusOf(58)).toBe("caution"));
  it("<40 danger", () => expect(statusOf(30)).toBe("danger"));
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run test/bsm/score.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

`wavecut/lib/bsm/score.ts`:

```ts
import type { SafetyStatus } from "./types";

export interface ScoreInput {
  dangerStart: number | null;                       // 위험 시작 거리(m), null=없음
  rip: "관심" | "주의" | "경계" | "위험" | "안전";   // 이안류 단계
  waveHeight: number;                               // 파고(m)
  tideRising: boolean;                              // 조위 상승 중
  windSpeed: number;                                // 풍속(m/s)
  quality: "적합" | "주의" | "부적합";                // 수질
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

// 항목별 0~100 점수
function depthScore(dangerStart: number | null): number {
  if (dangerStart === null) return 100;
  // 위험 시작이 가까울수록 위험. 0m→0점, 60m+→100점
  return clamp((dangerStart / 60) * 100);
}
function ripScore(rip: ScoreInput["rip"]): number {
  return { "안전": 100, "관심": 90, "주의": 60, "경계": 30, "위험": 0 }[rip];
}
function waveScore(h: number): number {
  if (h <= 0.5) return 100;
  if (h <= 1.0) return 60;
  if (h <= 1.5) return 20;
  return 0;
}
function tideScore(rising: boolean): number { return rising ? 60 : 100; }
function windScore(w: number): number { return clamp(100 - w * 5); } // 20m/s에서 0점
function qualityScore(q: ScoreInput["quality"]): number {
  return { "적합": 100, "주의": 50, "부적합": 0 }[q];
}

export function computeScore(input: ScoreInput): number {
  const weighted =
    depthScore(input.dangerStart) * 0.30 +
    ripScore(input.rip) * 0.25 +
    waveScore(input.waveHeight) * 0.20 +
    tideScore(input.tideRising) * 0.10 +
    windScore(input.windSpeed) * 0.10 +
    qualityScore(input.quality) * 0.05;
  return Math.round(clamp(weighted));
}

export function statusOf(score: number): SafetyStatus {
  if (score >= 70) return "safe";
  if (score >= 40) return "caution";
  return "danger";
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run test/bsm/score.test.ts`
Expected: PASS

- [ ] **Step 5: 전체 BSM 테스트 회귀 확인**

Run: `npm run test`
Expected: 4개 테스트 파일 전부 PASS

- [ ] **Step 6: Commit**

```bash
git add lib/bsm/score.ts test/bsm/score.test.ts
git commit -m "feat: add weighted safety score computation"
```

---

## Phase 2: API Layer (공공 데이터 연동)

각 fetch 함수는 서버 전용. 실패 시 `null` 반환 → 상위에서 fallback. 모든 fetch는 `next: { revalidate: 3600 }`.

### Task 2.1: Fallback 데이터 + 환경변수 + 관측소 매핑

**Files:**
- Create: `wavecut/lib/data/fallback.ts`
- Create: `wavecut/lib/api/env.ts`
- Create: `wavecut/lib/api/stations.ts`
- Create: `wavecut/.env.local.example`
- Test: `wavecut/test/data/fallback.test.ts`

**Interfaces:**
- Consumes: `TransectParams` (Task 1.2), `SafetyStatus` (Task 1.1)
- Produces:
  - `interface BeachStatic { id; name; region; length; family; feature; parking; parkDist; summary; transects: TransectParams[] }`
  - `interface BeachFallback extends BeachStatic { score; status; wave; rip; tide; tideTrend; water; crowd; sky; air; uv }`
  - `const BEACH_IDS: string[]`
  - `const FALLBACK: Record<string, BeachFallback>`
  - `const STATIONS: Record<string, { tideObsCode; gridX; gridY; waveGrid; ripCode; lat; lon }>`
  - `function getEnv(key: string): string`

- [ ] **Step 1: 실패하는 테스트 작성**

`wavecut/test/data/fallback.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { FALLBACK, BEACH_IDS } from "@/lib/data/fallback";

describe("fallback 데이터", () => {
  it("부산 5개 해변을 가진다", () => {
    expect(BEACH_IDS).toEqual(["haeundae", "gwangalli", "songjeong", "songdo", "dadaepo"]);
  });
  it("각 해변은 3개 transect를 가진다", () => {
    for (const id of BEACH_IDS) {
      expect(FALLBACK[id].transects).toHaveLength(3);
    }
  });
  it("해운대는 score 86, status safe", () => {
    expect(FALLBACK.haeundae.score).toBe(86);
    expect(FALLBACK.haeundae.status).toBe("safe");
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run test/data/fallback.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: Fallback 구현 (data.js BEACHES 이식)**

`wavecut/lib/data/fallback.ts` — `design_files/data.js`의 `BEACHES` 배열(102–155행)을 TypeScript 객체로 이식. 5개 해변 전체 필드를 그대로 옮긴다. `transects[]`의 각 항목은 `{ shelf, shelfDepth, slope, rip }` 형태(이미 data.js와 동일).

```ts
import type { TransectParams } from "@/lib/bsm/profile";
import type { SafetyStatus } from "@/lib/bsm/types";

export interface BeachStatic {
  id: string; name: string; region: string; length: number;
  family: boolean; feature: boolean; parking: string; parkDist: string;
  summary: string; transects: TransectParams[];
}
export interface BeachFallback extends BeachStatic {
  score: number; status: SafetyStatus; wave: number;
  rip: string; tide: string; tideTrend: string; water: number;
  crowd: string; sky: string; air: number; uv: string;
}

export const BEACH_IDS = ["haeundae", "gwangalli", "songjeong", "songdo", "dadaepo"];

export const FALLBACK: Record<string, BeachFallback> = {
  haeundae: {
    id: "haeundae", name: "해운대 해수욕장", region: "부산 해운대구",
    score: 86, status: "safe", wave: 0.5, rip: "주의", tide: "중조", tideTrend: "상승",
    water: 23.4, family: true, feature: true, length: 1.5, crowd: "보통",
    sky: "맑음", air: 27, uv: "높음", parking: "해운대 공영주차장", parkDist: "도보 3분",
    summary: "넓고 완만한 모래턱이 가족 물놀이에 적합합니다.",
    transects: [
      { shelf: 28, shelfDepth: 0.7, slope: 0.06, rip: false },
      { shelf: 42, shelfDepth: 0.75, slope: 0.05, rip: false },
      { shelf: 22, shelfDepth: 0.9, slope: 0.11, rip: true },
    ],
  },
  // gwangalli, songjeong, songdo, dadaepo — data.js 115–154행을 동일하게 이식
};
```

> 구현자 주의: 나머지 4개 해변(gwangalli/songjeong/songdo/dadaepo)도 `design_files/data.js` 115–154행 값을 빠짐없이 복사할 것. 필드명은 위 인터페이스와 1:1 대응.

`wavecut/lib/api/env.ts`:

```ts
export function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
}
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}
```

`wavecut/lib/api/stations.ts` — 각 해변의 공공 API 식별 코드 매핑. 실제 코드값은 data.go.kr 발급 후 채우되, 구조는 아래 고정:

```ts
export interface StationMap {
  lat: number; lon: number;
  tideObsCode: string;  // 국립해양조사원 조위관측소 코드
  gridX: number;        // 기상청 격자 X (nx)
  gridY: number;        // 기상청 격자 Y (ny)
  waveGrid: string;     // 파랑 격자번호
  ripCode: string;      // 이안류 해수욕장 코드
  beachInfoCode: string;// 해수욕장 정보 코드
  qualityCode: string;  // 부산 수질 측정지점 코드
}

export const STATIONS: Record<string, StationMap> = {
  haeundae:  { lat: 35.1587, lon: 129.1604, tideObsCode: "DT_0063", gridX: 99, gridY: 75, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
  gwangalli: { lat: 35.1532, lon: 129.1185, tideObsCode: "DT_0063", gridX: 98, gridY: 75, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
  songjeong: { lat: 35.1786, lon: 129.2003, tideObsCode: "DT_0063", gridX: 100, gridY: 76, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
  songdo:    { lat: 35.0758, lon: 129.0166, tideObsCode: "DT_0051", gridX: 97, gridY: 74, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
  dadaepo:   { lat: 35.0494, lon: 128.9663, tideObsCode: "DT_0051", gridX: 96, gridY: 73, waveGrid: "", ripCode: "", beachInfoCode: "", qualityCode: "" },
};
```

`wavecut/.env.local.example`:

```
# data.go.kr 발급 키 (Decoding 키 사용)
DATA_GO_KR_KEY=발급키입력
KMA_API_KEY=발급키입력
# 좌표/코드는 lib/api/stations.ts 에서 관리
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run test/data/fallback.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/data/fallback.ts lib/api/env.ts lib/api/stations.ts .env.local.example test/data/fallback.test.ts
git commit -m "feat: add fallback beach data, env access, station mapping"
```

### Task 2.2: 공공 API fetch 함수 (조위·날씨·해수욕장정보·이안류·파랑·수질·수심)

각 함수는 같은 패턴이다: URL 구성 → fetch → 파싱 → 도메인 타입 반환, 실패 시 `null`. 테스트는 `vi.fn`으로 `fetch`를 모킹해 파싱 로직만 검증한다.

**Files:**
- Create: `wavecut/lib/api/tide.ts`, `weather.ts`, `beachInfo.ts`, `rip.ts`, `wave.ts`, `quality.ts`, `bathymetry.ts`
- Test: `wavecut/test/api/parsers.test.ts`

**Interfaces:**
- Consumes: `STATIONS`, `getEnv` (Task 2.1), `GridSample` (Task 1.2)
- Produces (모두 실패 시 `null` 가능):
  - `fetchTide(id): Promise<{ nowOffset: number; t1Offset: number; t2Offset: number; rising: boolean; label: string } | null>`
  - `fetchWeather(id): Promise<{ sky: string; air: number; uv: string; windSpeed: number } | null>`
  - `fetchBeachInfo(id): Promise<{ waveHeight: number; water: number; windSpeed: number; windDir: string } | null>`
  - `fetchRip(id): Promise<{ level: "관심"|"주의"|"경계"|"위험" } | null>`
  - `fetchWave(id): Promise<{ height: number; dir: string; period: number } | null>`
  - `fetchQuality(id): Promise<{ grade: "적합"|"주의"|"부적합" } | null>`
  - `fetchBathymetry(id): Promise<{ left: GridSample[]; center: GridSample[]; right: GridSample[] } | null>`

- [ ] **Step 1: 파서를 분리 가능하게 설계하는 테스트 작성**

각 fetch 함수에서 응답 JSON→도메인 변환 부분을 순수 함수 `parseX(json)`로 분리하고 그걸 테스트한다.

`wavecut/test/api/parsers.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseTide } from "@/lib/api/tide";
import { parseRip } from "@/lib/api/rip";
import { parseQuality } from "@/lib/api/quality";

describe("parseTide", () => {
  it("관측 조위에서 now/t1/t2 오프셋을 계산한다", () => {
    const json = { result: { data: [
      { record_time: "2026-06-25 14:00:00", tide_level: "120" },
      { record_time: "2026-06-25 15:00:00", tide_level: "155" },
      { record_time: "2026-06-25 16:00:00", tide_level: "190" },
    ] } };
    const r = parseTide(json, "2026-06-25 14:00:00");
    expect(r).not.toBeNull();
    expect(r!.nowOffset).toBeCloseTo(0, 2);
    expect(r!.t1Offset).toBeCloseTo(0.35, 2);
    expect(r!.t2Offset).toBeCloseTo(0.70, 2);
    expect(r!.rising).toBe(true);
  });
  it("데이터가 없으면 null", () => {
    expect(parseTide({ result: { data: [] } }, "2026-06-25 14:00:00")).toBeNull();
  });
});

describe("parseRip", () => {
  it("이안류 지수를 단계로 매핑", () => {
    expect(parseRip({ response: { body: { items: { item: [{ rip_index: "3" }] } } } })!.level).toBe("경계");
  });
});

describe("parseQuality", () => {
  it("수질 평가 등급을 매핑", () => {
    expect(parseQuality({ items: [{ grade: "적합" }] })!.grade).toBe("적합");
  });
});
```

> 주의: 실제 공공 API 응답 스키마는 발급 후 확정된다. 위 JSON 형태는 예시이며, 구현자는 실제 응답에 맞춰 `parseX`의 키 경로만 조정하되 **반환 타입은 고정**한다. 테스트 픽스처도 실제 응답으로 교체한다.

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run test/api/parsers.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: tide.ts 구현 (대표 패턴)**

`wavecut/lib/api/tide.ts`:

```ts
import { getEnv } from "./env";
import { STATIONS } from "./stations";

export interface TideResult {
  nowOffset: number; t1Offset: number; t2Offset: number; rising: boolean; label: string;
}

interface TideRecord { record_time: string; tide_level: string }

// cm 단위 조위를 받아 now 기준 상대 오프셋(m)으로 변환
export function parseTide(json: unknown, nowTime: string): TideResult | null {
  const data = (json as { result?: { data?: TideRecord[] } })?.result?.data;
  if (!data || data.length === 0) return null;
  const findLevel = (time: string): number | null => {
    const rec = data.find((d) => d.record_time === time);
    return rec ? parseFloat(rec.tide_level) : null;
  };
  const sorted = [...data].sort((a, b) => a.record_time.localeCompare(b.record_time));
  const nowCm = findLevel(nowTime) ?? parseFloat(sorted[0].tide_level);
  // now 이후 시각 두 개를 1·2시간 후로 사용
  const idx = sorted.findIndex((d) => d.record_time === nowTime);
  const base = idx >= 0 ? idx : 0;
  const t1Cm = sorted[base + 1] ? parseFloat(sorted[base + 1].tide_level) : nowCm;
  const t2Cm = sorted[base + 2] ? parseFloat(sorted[base + 2].tide_level) : t1Cm;
  return {
    nowOffset: 0,
    t1Offset: (t1Cm - nowCm) / 100,
    t2Offset: (t2Cm - nowCm) / 100,
    rising: t2Cm > nowCm,
    label: "중조",
  };
}

export async function fetchTide(id: string): Promise<TideResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnv("DATA_GO_KR_KEY");
    const url = `https://www.khoa.go.kr/api/oceangrid/tideObs/search.do?ServiceKey=${key}&ObsCode=${st.tideObsCode}&ResultType=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const now = new Date().toISOString().slice(0, 13).replace("T", " ") + ":00:00";
    return parseTide(json, now);
  } catch {
    return null;
  }
}
```

> 나머지 fetch 함수(weather/beachInfo/rip/wave/quality/bathymetry)도 **동일 패턴**으로 구현한다: `parseX` 순수 함수 + `fetchX` async 래퍼(try/catch, 실패 시 null, `revalidate:3600`). 각 `parseX`/반환 타입은 위 Interfaces 블록에 명시된 시그니처를 따른다.

`wavecut/lib/api/rip.ts`:

```ts
import { getEnv } from "./env";
import { STATIONS } from "./stations";

export interface RipResult { level: "관심" | "주의" | "경계" | "위험" }

const RIP_LEVELS = ["관심", "주의", "경계", "위험"] as const;

export function parseRip(json: unknown): RipResult | null {
  const item = (json as { response?: { body?: { items?: { item?: Array<{ rip_index?: string }> } } } })
    ?.response?.body?.items?.item?.[0];
  if (!item?.rip_index) return null;
  const idx = Math.max(0, Math.min(3, parseInt(item.rip_index, 10)));
  return { level: RIP_LEVELS[idx] };
}

export async function fetchRip(id: string): Promise<RipResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnv("DATA_GO_KR_KEY");
    const url = `https://apis.data.go.kr/1192136/ripCurrent?serviceKey=${key}&beachCode=${st.ripCode}&type=json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseRip(await res.json());
  } catch {
    return null;
  }
}
```

`wavecut/lib/api/quality.ts`:

```ts
export interface QualityResult { grade: "적합" | "주의" | "부적합" }

export function parseQuality(json: unknown): QualityResult | null {
  const item = (json as { items?: Array<{ grade?: string }> })?.items?.[0];
  if (!item?.grade) return null;
  const g = item.grade;
  if (g === "적합" || g === "주의" || g === "부적합") return { grade: g };
  return { grade: "주의" };
}

export async function fetchQuality(id: string): Promise<QualityResult | null> {
  // weather.ts/tide.ts와 동일 패턴: STATIONS[id].qualityCode 사용, 실패 시 null
  return null; // 구현자: 실제 부산 수질 API URL로 채울 것
}
```

> `weather.ts`, `beachInfo.ts`, `wave.ts`, `bathymetry.ts`도 같은 골격으로 작성. `bathymetry.ts`의 `fetchBathymetry`는 자연과학용 수심정보 격자에서 각 해변의 좌/중/우 단면선 방향 샘플을 추출해 `GridSample[]` 3벌을 반환한다. 실데이터 확보가 어려우면 `null` 반환 → 상위에서 fallback transect 사용.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run test/api/parsers.test.ts`
Expected: PASS (parseTide/parseRip/parseQuality)

- [ ] **Step 5: Commit**

```bash
git add lib/api/ test/api/parsers.test.ts
git commit -m "feat: add public API fetchers with pure parsers and null fallback"
```

### Task 2.3: 데이터 조합 레이어 (aggregate)

페이지가 호출하는 단일 진입점. 여러 API를 병렬 호출하고 fallback과 병합해 화면용 모델을 만든다.

**Files:**
- Create: `wavecut/lib/api/aggregate.ts`
- Test: `wavecut/test/api/aggregate.test.ts`

**Interfaces:**
- Consumes: 모든 `fetchX` (Task 2.2), `FALLBACK` (Task 2.1), `profileFromTransect`/`profileFromGrid`/`transectAt`/`analyze` (Task 1.2), `computeScore`/`statusOf` (Task 1.4)
- Produces:
  - `interface BeachSummary { id; name; region; status: SafetyStatus; score; sky; air; uv; crowd }` (카드/홈용 — 정보 위계상 쉬운 정보만)
  - `interface BeachDetail extends BeachSummary { wave; tide; tideTrend; rip; water; family; parking; parkDist; length; summary; windSpeed; quality; tideOffsets: { now; t1; t2 }; transects: TransectParams[]; grid: { left; center; right } | null }`
  - `function getBeachSummary(id: string): Promise<BeachSummary>`
  - `function getAllSummaries(): Promise<BeachSummary[]>`
  - `function getBeachDetail(id: string): Promise<BeachDetail>`

- [ ] **Step 1: 실패하는 테스트 작성**

`wavecut/test/api/aggregate.test.ts` — 모든 fetch를 모킹해 fallback 병합·점수 계산을 검증.

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/tide", () => ({ fetchTide: vi.fn() }));
vi.mock("@/lib/api/weather", () => ({ fetchWeather: vi.fn() }));
vi.mock("@/lib/api/beachInfo", () => ({ fetchBeachInfo: vi.fn() }));
vi.mock("@/lib/api/rip", () => ({ fetchRip: vi.fn() }));
vi.mock("@/lib/api/wave", () => ({ fetchWave: vi.fn() }));
vi.mock("@/lib/api/quality", () => ({ fetchQuality: vi.fn() }));
vi.mock("@/lib/api/bathymetry", () => ({ fetchBathymetry: vi.fn() }));

import { fetchTide } from "@/lib/api/tide";
import { fetchWeather } from "@/lib/api/weather";
import { getBeachSummary, getBeachDetail } from "@/lib/api/aggregate";

beforeEach(() => vi.clearAllMocks());

describe("getBeachSummary", () => {
  it("API 전부 실패해도 fallback으로 채운다", async () => {
    (fetchTide as any).mockResolvedValue(null);
    (fetchWeather as any).mockResolvedValue(null);
    const s = await getBeachSummary("haeundae");
    expect(s.id).toBe("haeundae");
    expect(s.name).toBe("해운대 해수욕장");
    expect(["safe", "caution", "danger"]).toContain(s.status);
    // 정보 위계: summary에는 wave/tide/rip이 없어야 한다
    expect((s as any).wave).toBeUndefined();
    expect((s as any).rip).toBeUndefined();
  });
  it("날씨 API 성공 시 실데이터로 덮어쓴다", async () => {
    (fetchWeather as any).mockResolvedValue({ sky: "비", air: 19, uv: "보통", windSpeed: 4 });
    const s = await getBeachSummary("haeundae");
    expect(s.sky).toBe("비");
    expect(s.air).toBe(19);
  });
});

describe("getBeachDetail", () => {
  it("상세는 전문 정보를 포함한다", async () => {
    (fetchTide as any).mockResolvedValue({ nowOffset: 0, t1Offset: 0.35, t2Offset: 0.7, rising: true, label: "중조" });
    const d = await getBeachDetail("haeundae");
    expect(d.wave).toBeGreaterThanOrEqual(0);
    expect(d.tideOffsets.t2).toBeCloseTo(0.7, 2);
    expect(d.transects).toHaveLength(3);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run test/api/aggregate.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

`wavecut/lib/api/aggregate.ts`:

```ts
import { FALLBACK, BEACH_IDS } from "@/lib/data/fallback";
import type { SafetyStatus } from "@/lib/bsm/types";
import type { TransectParams, GridSample } from "@/lib/bsm/profile";
import { profileFromTransect, transectAt, analyze } from "@/lib/bsm/profile";
import { computeScore, statusOf } from "@/lib/bsm/score";
import { fetchTide } from "./tide";
import { fetchWeather } from "./weather";
import { fetchBeachInfo } from "./beachInfo";
import { fetchRip } from "./rip";
import { fetchWave } from "./wave";
import { fetchQuality } from "./quality";
import { fetchBathymetry } from "./bathymetry";

export interface BeachSummary {
  id: string; name: string; region: string;
  status: SafetyStatus; score: number;
  sky: string; air: number; uv: string; crowd: string;
}
export interface BeachDetail extends BeachSummary {
  wave: number; tide: string; tideTrend: string; rip: string;
  water: number; family: boolean; parking: string; parkDist: string;
  length: number; summary: string; windSpeed: number;
  quality: "적합" | "주의" | "부적합";
  tideOffsets: { now: number; t1: number; t2: number };
  transects: TransectParams[];
  grid: { left: GridSample[]; center: GridSample[]; right: GridSample[] } | null;
}

const RIP_TEXT = (lvl: string): "관심"|"주의"|"경계"|"위험"|"안전" =>
  (["관심","주의","경계","위험"].includes(lvl) ? lvl : "안전") as any;

export async function getBeachDetail(id: string): Promise<BeachDetail> {
  const fb = FALLBACK[id];
  const [tide, weather, info, rip, wave, quality, grid] = await Promise.all([
    fetchTide(id), fetchWeather(id), fetchBeachInfo(id),
    fetchRip(id), fetchWave(id), fetchQuality(id), fetchBathymetry(id),
  ]);

  const tideOffsets = {
    now: tide?.nowOffset ?? 0,
    t1: tide?.t1Offset ?? 0.35,
    t2: tide?.t2Offset ?? 0.70,
  };
  const waveHeight = wave?.height ?? info?.waveHeight ?? fb.wave;
  const ripLabel = rip ? rip.level : fb.rip;
  const qualityGrade = quality?.grade ?? "적합";
  const windSpeed = info?.windSpeed ?? weather?.windSpeed ?? 3;
  const tideRising = tide?.rising ?? (fb.tideTrend === "상승");

  // 중앙 단면 기준 위험시작으로 점수 산정
  const centerBed = profileFromTransect(transectAt(fb.transects, 0.5));
  const { dangerStart } = analyze(centerBed, tideOffsets.now);
  const score = computeScore({
    dangerStart, rip: RIP_TEXT(ripLabel), waveHeight,
    tideRising, windSpeed, quality: qualityGrade,
  });

  return {
    id: fb.id, name: fb.name, region: fb.region,
    status: statusOf(score), score,
    sky: weather?.sky ?? fb.sky, air: weather?.air ?? fb.air,
    uv: weather?.uv ?? fb.uv, crowd: fb.crowd,
    wave: waveHeight, tide: tide?.label ?? fb.tide,
    tideTrend: tideRising ? "상승" : "하강", rip: ripLabel,
    water: info?.water ?? fb.water, family: fb.family,
    parking: fb.parking, parkDist: fb.parkDist, length: fb.length,
    summary: fb.summary, windSpeed, quality: qualityGrade,
    tideOffsets, transects: fb.transects,
    grid: grid ?? null,
  };
}

export async function getBeachSummary(id: string): Promise<BeachSummary> {
  const d = await getBeachDetail(id);
  // 정보 위계: 쉬운 정보만 추출
  return {
    id: d.id, name: d.name, region: d.region,
    status: d.status, score: d.score,
    sky: d.sky, air: d.air, uv: d.uv, crowd: d.crowd,
  };
}

export async function getAllSummaries(): Promise<BeachSummary[]> {
  return Promise.all(BEACH_IDS.map(getBeachSummary));
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run test/api/aggregate.test.ts`
Expected: PASS

- [ ] **Step 5: Route Handlers 추가**

`wavecut/app/api/beaches/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getAllSummaries } from "@/lib/api/aggregate";

export async function GET() {
  return NextResponse.json(await getAllSummaries());
}
```

`wavecut/app/api/beach/[id]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getBeachDetail } from "@/lib/api/aggregate";
import { BEACH_IDS } from "@/lib/data/fallback";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!BEACH_IDS.includes(id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(await getBeachDetail(id));
}
```

- [ ] **Step 6: 전체 테스트 + 빌드 회귀**

Run: `npm run test`
Expected: 전체 PASS

Run: `npm run build`
Expected: 빌드 성공 (route handlers 포함). 타입 에러 없음.

- [ ] **Step 7: Commit**

```bash
git add lib/api/aggregate.ts app/api/ test/api/aggregate.test.ts
git commit -m "feat: add data aggregation layer and route handlers"
```

---

## Phase 3: Shared Components

`design_files/components.jsx`와 `CrossSection.jsx`를 React+TypeScript 컴포넌트로 이식. 스타일은 `design_files/screens.css`를 CSS Module로 옮긴다.

### Task 3.1: 기본 UI 컴포넌트 (StatusPill, Icon, Stat, ScoreGauge, 브랜드)

**Files:**
- Create: `wavecut/components/shared/StatusPill.tsx`, `Icon.tsx`, `Stat.tsx`, `ScoreGauge.tsx`, `WaveLogo.tsx`, `WaveWordmark.tsx`
- Create: `wavecut/components/shared/shared.module.css`
- Test: `wavecut/test/components/statusPill.test.tsx`

**Interfaces:**
- Consumes: `SafetyStatus` (Task 1.1)
- Produces:
  - `<StatusPill status={SafetyStatus} big?>{label?}</StatusPill>`
  - `<Icon name={string} size? color? />`
  - `<Stat icon label value unit? status? />`
  - `<ScoreGauge score={number} status={SafetyStatus} size? />`
  - `<WaveLogo size? radius? light? />`, `<WaveWordmark light? sub? size? />`

- [ ] **Step 1: 테스트 환경에 jsdom 추가**

```bash
npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

`vitest.config.ts`의 `test`에 추가: `environment: "jsdom"` (또는 컴포넌트 테스트만 별도 설정). `include`에 `test/**/*.test.tsx` 추가.

- [ ] **Step 2: 실패하는 테스트 작성**

`wavecut/test/components/statusPill.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "@/components/shared/StatusPill";

describe("StatusPill", () => {
  it("기본 라벨을 status에서 가져온다", () => {
    render(<StatusPill status="safe" />);
    expect(screen.getByText("안전")).toBeDefined();
  });
  it("children으로 라벨을 덮어쓴다", () => {
    render(<StatusPill status="danger">위험구간</StatusPill>);
    expect(screen.getByText("위험구간")).toBeDefined();
  });
});
```

- [ ] **Step 3: 테스트 실패 확인**

Run: `npx vitest run test/components/statusPill.test.tsx`
Expected: FAIL — 모듈 없음

- [ ] **Step 4: 구현**

`wavecut/components/shared/StatusPill.tsx` — `components.jsx`의 `StatusPill`(6–12행) 이식:

```tsx
import type { SafetyStatus } from "@/lib/bsm/types";
import styles from "./shared.module.css";

const SC: Record<SafetyStatus, string> = { safe: "var(--safe)", caution: "var(--caution)", danger: "var(--danger)" };
const SBG: Record<SafetyStatus, string> = { safe: "var(--safe-bg)", caution: "var(--caution-bg)", danger: "var(--danger-bg)" };
const SLABEL: Record<SafetyStatus, string> = { safe: "안전", caution: "주의", danger: "위험" };

export function StatusPill({ status, children, big }: {
  status: SafetyStatus; children?: React.ReactNode; big?: boolean;
}) {
  return (
    <span className={`${styles.pill} ${big ? styles.pillBig : ""}`}
      style={{ color: SC[status], background: SBG[status] }}>
      <i className="dot" style={{ background: SC[status] }} />
      {children ?? SLABEL[status]}
    </span>
  );
}
export { SC, SBG, SLABEL };
```

`Icon.tsx` — `components.jsx`의 `Icon`(15–41행) 전체 paths 객체를 그대로 이식 (TypeScript: `name: keyof typeof paths`). `Stat.tsx`(44–54행), `ScoreGauge.tsx`(57–69행), `WaveLogo.tsx`(107–122행), `WaveWordmark.tsx`(125–132행)도 동일하게 이식.

`shared.module.css` — `design_files/screens.css`에서 `.pill`, `.stat`, `.gauge`, `.wave-logo`, `.wc-lockup` 등 해당 컴포넌트 클래스를 복사. (클래스명을 CSS Module 카멜케이스로 변환하거나, `:global()` 래핑 중 택1. 프로젝트는 CSS Module 카멜케이스로 통일.)

> 구현자: `screens.css`를 열어 각 컴포넌트가 쓰는 클래스 규칙을 빠짐없이 가져올 것. 누락 시 레이아웃이 깨진다.

- [ ] **Step 5: 테스트 통과 확인**

Run: `npx vitest run test/components/statusPill.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add components/shared/ test/components/statusPill.test.tsx vitest.config.ts package.json
git commit -m "feat: add shared UI components (StatusPill, Icon, Stat, ScoreGauge, brand)"
```

### Task 3.2: CrossSection (단면 수심 뷰 — 핵심 Client Component)

**Files:**
- Create: `wavecut/components/shared/CrossSection.tsx`
- Create: `wavecut/components/shared/DepthLegend.tsx`, `AiCommentCard.tsx`
- Create: `wavecut/components/shared/crossSection.module.css`
- Test: `wavecut/test/components/crossSection.test.tsx`

**Interfaces:**
- Consumes: `LEVELS`/`levelOf` (1.1), `profileFromTransect`/`profileFromGrid`/`transectAt`/`depthAt`/`analyze` (1.2), `aiComment` (1.3), `BeachDetail` (2.3)
- Produces: `<CrossSection beach={BeachDetail} compact? showAI? />` (`"use client"`)

- [ ] **Step 1: 실패하는 테스트 작성**

`wavecut/test/components/crossSection.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CrossSection } from "@/components/shared/CrossSection";
import { FALLBACK } from "@/lib/data/fallback";

// BeachDetail 형태로 최소 변환한 fixture
const beach = {
  ...FALLBACK.haeundae, score: 86, status: "safe" as const,
  windSpeed: 3, quality: "적합" as const,
  tideOffsets: { now: 0, t1: 0.35, t2: 0.7 },
  grid: null,
};

describe("CrossSection", () => {
  it("조위 시뮬레이션 탭 3개를 렌더한다", () => {
    render(<CrossSection beach={beach as any} />);
    expect(screen.getByText("현재")).toBeDefined();
    expect(screen.getByText("1시간 후")).toBeDefined();
    expect(screen.getByText("2시간 후")).toBeDefined();
  });
  it("AI 코멘트를 표시한다", () => {
    render(<CrossSection beach={beach as any} />);
    expect(screen.getByText(/단면은 해안선에서 약/)).toBeDefined();
  });
  it("시간대를 바꾸면 코멘트가 갱신된다", () => {
    render(<CrossSection beach={beach as any} />);
    const before = screen.getByText(/단면은 해안선에서 약/).textContent;
    fireEvent.click(screen.getByText("2시간 후"));
    const after = screen.getByText(/단면은 해안선에서 약/).textContent;
    expect(after).not.toEqual(before); // 조위 상승으로 kneeEnd 변화
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run test/components/crossSection.test.tsx`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현**

`wavecut/components/shared/CrossSection.tsx` — `design_files/CrossSection.jsx`(1–131행)를 이식하되:
- 최상단에 `"use client";`
- `window.BSM` 호출을 `@/lib/bsm/*` import로 교체
- 단면 깊이 계산은 `beach.grid`가 있으면 `profileFromGrid`, 없으면 `profileFromTransect(transectAt(beach.transects, p))` 사용
- 조위 오프셋은 `tideKey`에 따라 `beach.tideOffsets[tideKey === "now" ? "now" : tideKey]` 매핑
- 기하 상수(VB_W/VB_H/X0/X1/D_MIN/D_MAX/SURFACE_Y/SCALE/xOf/yOf)와 렌더 순서는 **그대로**

```tsx
"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LEVELS, levelOf } from "@/lib/bsm/levels";
import { profileFromTransect, profileFromGrid, transectAt, depthAt, analyze, type BedProfile } from "@/lib/bsm/profile";
import { aiComment } from "@/lib/bsm/aiComment";
import type { TideKey } from "@/lib/bsm/types";
import type { BeachDetail } from "@/lib/api/aggregate";
import { DepthLegend } from "./DepthLegend";
import { AiCommentCard } from "./AiCommentCard";
import styles from "./crossSection.module.css";

export function CrossSection({ beach, compact = false, showAI = true }: {
  beach: BeachDetail; compact?: boolean; showAI?: boolean;
}) {
  const [p, setP] = useState(0.5);
  const [tideKey, setTideKey] = useState<TideKey>("now");
  const [drag, setDrag] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

  const tideOffset = beach.tideOffsets[tideKey];

  // p 또는 grid에 따라 BedProfile 구성
  const bed: BedProfile = useMemo(() => {
    if (beach.grid) {
      const g = p < 0.34 ? beach.grid.left : p < 0.67 ? beach.grid.center : beach.grid.right;
      return profileFromGrid(g);
    }
    return profileFromTransect(transectAt(beach.transects, p));
  }, [beach, p]);

  const move = useCallback((clientX: number) => {
    const el = planRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    let np = (clientX - r.left) / r.width;
    np = Math.max(0.02, Math.min(0.98, np));
    setP(np);
  }, []);
  useEffect(() => {
    if (!drag) return;
    const mv = (e: PointerEvent) => move(e.clientX);
    const up = () => setDrag(false);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag, move]);

  const TIMES = [
    { key: "now" as const, label: "현재", clock: "14:00" },
    { key: "t1" as const, label: "1시간 후", clock: "15:00" },
    { key: "t2" as const, label: "2시간 후", clock: "16:00" },
  ];

  // ----- 기하 (CrossSection.jsx 26–30행 그대로) -----
  const VB_W = 820, VB_H = compact ? 300 : 340;
  const X0 = 56, X1 = VB_W - 18, D_MIN = -12, D_MAX = 80;
  const SURFACE_Y = 64, SCALE = (VB_H - 34 - SURFACE_Y) / 2.4;
  const xOf = (d: number) => X0 + ((d - D_MIN) / (D_MAX - D_MIN)) * (X1 - X0);
  const yOf = (depth: number) => SURFACE_Y + depth * SCALE;

  const cols: { x: number; w: number; y: number; h: number; color: string }[] = [];
  const bedPts: [number, number][] = [];
  for (let d = D_MIN; d <= D_MAX; d += 2) {
    const dep = depthAt(bed, tideOffset, d);
    bedPts.push([xOf(d), yOf(dep)]);
    if (dep > 0.02) {
      cols.push({ x: xOf(d), w: ((X1 - X0) / (D_MAX - D_MIN)) * 2 + 0.6, y: SURFACE_Y, h: yOf(dep) - SURFACE_Y, color: levelOf(dep).cssVar });
    }
  }
  const groundPath = `M ${xOf(D_MIN)} ${VB_H} L ` + bedPts.map((pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" L ") + ` L ${xOf(D_MAX)} ${VB_H} Z`;
  const bedLine = "M " + bedPts.map((pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" L ");
  const a = analyze(bed, tideOffset);
  const posName = p < 0.34 ? "좌측" : p < 0.67 ? "중앙" : "우측";
  const guides = [
    { depth: 0.3, label: "발목" }, { depth: 0.6, label: "무릎" },
    { depth: 1.0, label: "허리" }, { depth: 1.5, label: "가슴 · 위험" },
  ];

  // ----- 이하 JSX: CrossSection.jsx 53–129행 구조 그대로, className은 styles.* 로,
  //       seg 버튼/plan/profile-svg/depth-legend/AIComment 순서 유지 -----
  return (
    <div className={styles.xsec}>
      {/* 시간대 탭, 평면도, 수직 단면도 SVG, DepthLegend, AiCommentCard */}
      {/* CrossSection.jsx의 마크업을 그대로 옮기되 window.BSM 호출은 위 지역 변수로 대체 */}
      {/* showAI && <AiCommentCard beachName={beach.name} text={aiComment(a, p)} /> */}
      {/* (지면상 생략 — 원본 55–128행을 1:1 이식할 것) */}
    </div>
  );
}
```

> **구현자 필수:** 위 JSX 본문은 `design_files/CrossSection.jsx` 53–129행을 그대로 옮기되 — (1) `className`을 `styles.*`로, (2) `B.depthAt`/`B.levelOf`/`B.analyze`/`B.aiComment` 호출을 위에서 만든 지역 변수(`cols`, `a`, `levelOf(dep).cssVar`, `aiComment(a, p)`)로, (3) `<AIComment>`를 `<AiCommentCard beachName={beach.name} text={aiComment(a, p)} />`로 교체. 렌더 순서(수면 사각형 → 컬럼 → 해저 채움 → 해저선 → 수면선 → 가이드선 → 위험표시 → 추천구간 → 거리눈금)는 절대 바꾸지 말 것.

`DepthLegend.tsx` — `LEVELS`를 순회해 6개 컬러 칩 (`CrossSection.jsx` 121–125행).
`AiCommentCard.tsx` — `CrossSection.jsx`의 `AIComment`(133–145행) 이식, props는 `{ beachName: string; text: string }`.
`crossSection.module.css` — `screens.css`에서 `.xsec`, `.seg`, `.plan`, `.profile`, `.depth-legend`, `.ai-card` 관련 규칙 전부 이식.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run test/components/crossSection.test.tsx`
Expected: PASS (탭 3개, AI 코멘트, 시간대 전환 갱신)

- [ ] **Step 5: Commit**

```bash
git add components/shared/CrossSection.tsx components/shared/DepthLegend.tsx components/shared/AiCommentCard.tsx components/shared/crossSection.module.css test/components/crossSection.test.tsx
git commit -m "feat: add interactive CrossSection depth view component"
```

### Task 3.3: BeachCard

**Files:**
- Create: `wavecut/components/shared/BeachCard.tsx`
- Test: `wavecut/test/components/beachCard.test.tsx`

**Interfaces:**
- Consumes: `BeachSummary` (2.3), `StatusPill`/`Stat`/`ScoreGauge`/`Icon` (3.1)
- Produces: `<BeachCard beach={BeachSummary} href={string} feature? />`

정보 위계 검증이 핵심: 카드에 wave/tide/rip 텍스트가 없어야 한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`wavecut/test/components/beachCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BeachCard } from "@/components/shared/BeachCard";

const summary = {
  id: "haeundae", name: "해운대 해수욕장", region: "부산 해운대구",
  status: "safe" as const, score: 86, sky: "맑음", air: 27, uv: "높음", crowd: "보통",
};

describe("BeachCard (정보 위계)", () => {
  it("쉬운 정보(날씨/자외선/혼잡)를 노출한다", () => {
    render(<BeachCard beach={summary} href="/beach/haeundae" />);
    expect(screen.getByText("해운대 해수욕장")).toBeDefined();
    expect(screen.getByText(/맑음/)).toBeDefined();
  });
  it("전문 정보(파고/조위/이안류)를 노출하지 않는다", () => {
    const { container } = render(<BeachCard beach={summary} href="/beach/haeundae" />);
    expect(container.textContent).not.toMatch(/파고|조위|이안류/);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인 → Step 3: 구현 → Step 4: 통과 확인**

`BeachCard.tsx` — `components.jsx`의 `BeachCard`(71–101행) 이식. `onOpen` 콜백 대신 Next `<Link href>`로 감싼다. 이미지 슬롯은 줄무늬 플레이스홀더 유지. stat은 날씨/자외선/혼잡도 3개만 (정보 위계).

Run: `npx vitest run test/components/beachCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/shared/BeachCard.tsx test/components/beachCard.test.tsx
git commit -m "feat: add BeachCard with information hierarchy enforced"
```

---

## Phase 4: Web Screens

`design_files/WebScreens.jsx`, `WebExtra.jsx`를 라우트별 Server Component로 분해. 레이아웃/패널 마크업은 원본을 따른다.

### Task 4.1: 웹 셸 (사이드바 레이아웃)

**Files:**
- Create: `wavecut/app/(web)/layout.tsx`
- Create: `wavecut/components/web/Sidebar.tsx`, `TopHeader.tsx`
- Create: `wavecut/components/web/web.module.css`

**Interfaces:**
- Produces: `(web)` 라우트 그룹 공통 셸 — 좌측 사이드바(메인 대시보드/단면 수심 뷰/운영자 대시보드/데이터 출처) + 상단 헤더(브랜드 + 검색 + 실시간 상태).

- [ ] **Step 1: 셸 구현**

`app/(web)/layout.tsx`에서 `Sidebar` + `TopHeader` + `{children}` 배치. `Sidebar`의 메뉴 링크는 `/`, 단면 뷰는 대표 해변(`/beach/haeundae/xsec`), `/operator`, 데이터 출처 섹션. 마크업/클래스는 `WebScreens.jsx`의 사이드바 부분 이식.

- [ ] **Step 2: 빌드 확인**

Run: `npm run dev` → `/` 접속 → 사이드바/헤더 렌더 확인. (page는 다음 태스크)

- [ ] **Step 3: Commit**

```bash
git add "app/(web)/layout.tsx" components/web/Sidebar.tsx components/web/TopHeader.tsx components/web/web.module.css
git commit -m "feat: add web dashboard shell (sidebar + header)"
```

### Task 4.2: 웹 메인 대시보드

**Files:**
- Create: `wavecut/app/(web)/page.tsx`
- Create: `wavecut/components/web/HeroCard.tsx`, `FeatureRow.tsx`
- Modify: `wavecut/components/web/web.module.css`

**Interfaces:**
- Consumes: `getAllSummaries` (2.3), `BeachCard` (3.3), `HeroCard`, `FeatureRow`
- Produces: `/` 대시보드 페이지

- [ ] **Step 1: 페이지 구현 (Server Component)**

`app/(web)/page.tsx`:

```tsx
import { getAllSummaries } from "@/lib/api/aggregate";
import { BeachCard } from "@/components/shared/BeachCard";
import { HeroCard } from "@/components/web/HeroCard";
import { FeatureRow } from "@/components/web/FeatureRow";

export default async function Dashboard() {
  const beaches = await getAllSummaries();
  const counts = {
    safe: beaches.filter((b) => b.status === "safe").length,
    caution: beaches.filter((b) => b.status === "caution").length,
    danger: beaches.filter((b) => b.status === "danger").length,
    total: beaches.length,
  };
  const feature = beaches[0]; // 해운대 = MVP 대표
  return (
    <main>
      <HeroCard counts={counts} />
      <FeatureRow beach={feature} />
      <section /* 카드 그리드 */>
        {beaches.map((b) => (
          <BeachCard key={b.id} beach={b} href={`/beach/${b.id}`} feature={b.id === "haeundae"} />
        ))}
      </section>
    </main>
  );
}
```

`HeroCard.tsx`(네이비 히어로 + 안전/주의/위험/모니터링 카운트 4칸), `FeatureRow.tsx`(큰 이미지 + 쉬운 stat 4개 + 상세보기) — `WebScreens.jsx`의 히어로/FeatureRow 마크업 이식. **카드/히어로/FeatureRow 모두 쉬운 정보만** (정보 위계).

- [ ] **Step 2: 시각 확인**

Run: `npm run dev` → `/` → 히어로 카운트, 추천 해변, 5개 카드 그리드 렌더 확인.

- [ ] **Step 3: Commit**

```bash
git add "app/(web)/page.tsx" components/web/HeroCard.tsx components/web/FeatureRow.tsx components/web/web.module.css
git commit -m "feat: add web main dashboard page"
```

### Task 4.3: 웹 해수욕장 상세

**Files:**
- Create: `wavecut/app/(web)/beach/[id]/page.tsx`
- Create: `wavecut/components/web/OceanSafetyPanel.tsx`, `ParkingPanel.tsx`, `TideForecastPanel.tsx`, `SituationTips.tsx`, `DataSourcePanel.tsx`
- Modify: `wavecut/components/web/web.module.css`

**Interfaces:**
- Consumes: `getBeachDetail` (2.3), `ScoreGauge`/`Stat`/`Icon` (3.1), `situationTips` (1.3), `analyze`/`profileFromTransect`/`transectAt` (1.2)
- Produces: `/beach/[id]` 상세 페이지

- [ ] **Step 1: 페이지 구현**

`app/(web)/beach/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getBeachDetail } from "@/lib/api/aggregate";
import { BEACH_IDS } from "@/lib/data/fallback";
import { analyze, profileFromTransect, transectAt } from "@/lib/bsm/profile";
import { situationTips } from "@/lib/bsm/aiComment";
import { OceanSafetyPanel } from "@/components/web/OceanSafetyPanel";
import { ParkingPanel } from "@/components/web/ParkingPanel";
import { TideForecastPanel } from "@/components/web/TideForecastPanel";
import { SituationTips } from "@/components/web/SituationTips";

export function generateStaticParams() { return BEACH_IDS.map((id) => ({ id })); }

export default async function BeachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!BEACH_IDS.includes(id)) notFound();
  const beach = await getBeachDetail(id);
  const a = analyze(profileFromTransect(transectAt(beach.transects, 0.5)), beach.tideOffsets.now);
  const tips = situationTips(a, { family: beach.family, crowd: beach.crowd });
  return (
    <main>
      {/* 헤더: 이름 + 메타(지역·길이·날씨·자외선·혼잡) + ScoreGauge(80px) */}
      {/* 2-컬럼: 메인(단면 수심 뷰 진입 패널 + SituationTips) / 사이드(OceanSafetyPanel + ParkingPanel + TideForecastPanel + DataSourcePanel) */}
      <a href={`/beach/${id}/xsec`}>단면 수심 보기</a>
      <OceanSafetyPanel wave={beach.wave} tide={beach.tide} rip={beach.rip} family={beach.family} />
      <ParkingPanel parking={beach.parking} parkDist={beach.parkDist} />
      <TideForecastPanel offsets={beach.tideOffsets} />
      <SituationTips tips={tips} />
    </main>
  );
}
```

`OceanSafetyPanel`(파고/조위/이안류/가족이용 2×2), `ParkingPanel`(주차장명 + 도보거리 + 버튼 2개), `TideForecastPanel`(now/t1/t2 조위), `SituationTips`(4카드 2×2, 톤 컬러 보더), `DataSourcePanel`(데이터 출처) — `WebScreens.jsx`/`WebExtra.jsx` 마크업 이식. **전문 정보는 여기서만** 노출.

- [ ] **Step 2: 시각 확인**

Run: `npm run dev` → `/beach/haeundae` → 패널 4종, 상황별 4카드, 단면 보기 링크 확인.

- [ ] **Step 3: Commit**

```bash
git add "app/(web)/beach/[id]/page.tsx" components/web/
git commit -m "feat: add web beach detail page with expert panels"
```

### Task 4.4: 웹 단면 수심 뷰 + 운영자 대시보드

**Files:**
- Create: `wavecut/app/(web)/beach/[id]/xsec/page.tsx`
- Create: `wavecut/app/(web)/operator/page.tsx`
- Create: `wavecut/components/web/OperatorTable.tsx`

**Interfaces:**
- Consumes: `getBeachDetail` (2.3), `CrossSection` (3.2), `situationTips` (1.3), `getAllSummaries` (2.3)
- Produces: `/beach/[id]/xsec`, `/operator`

- [ ] **Step 1: 단면 뷰 페이지**

`app/(web)/beach/[id]/xsec/page.tsx` — `getBeachDetail`로 데이터를 받아 `<CrossSection beach={beach} />` 렌더 + 하단 `SituationTips`. 페이지는 Server Component, CrossSection만 Client.

```tsx
import { notFound } from "next/navigation";
import { getBeachDetail } from "@/lib/api/aggregate";
import { BEACH_IDS } from "@/lib/data/fallback";
import { CrossSection } from "@/components/shared/CrossSection";

export default async function XSecPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!BEACH_IDS.includes(id)) notFound();
  const beach = await getBeachDetail(id);
  return (
    <main>
      <h1>{beach.name} · 단면 수심 뷰</h1>
      <CrossSection beach={beach} />
    </main>
  );
}
```

- [ ] **Step 2: 운영자 대시보드**

`app/(web)/operator/page.tsx` — `WebExtra.jsx`의 운영자 화면(위험 구간 모니터링 테이블, 안내문 자동 생성, 안전요원 배치 참고) 이식. **현 프로토타입 수준 유지** — 크게 손대지 않음. `getAllSummaries`로 5개 해변 status 테이블만 채운다.

- [ ] **Step 3: 시각 확인 + 빌드**

Run: `npm run dev` → `/beach/songjeong/xsec` (드래그/탭 동작), `/operator` 확인.
Run: `npm run build`
Expected: 전체 라우트 빌드 성공.

- [ ] **Step 4: Commit**

```bash
git add "app/(web)/beach/[id]/xsec/page.tsx" "app/(web)/operator/page.tsx" components/web/OperatorTable.tsx
git commit -m "feat: add web cross-section view and operator dashboard"
```

---

## Phase 5: Mobile Web App (`/app`)

`design_files/AppScreens.jsx`, `App.jsx`를 `(mobile)` 라우트 그룹으로 이식. 390px 폰 프레임, 하단 탭 3개(홈/즐겨찾기/마이페이지).

### Task 5.1: 모바일 셸 (하단 탭)

**Files:**
- Create: `wavecut/app/(mobile)/layout.tsx`
- Create: `wavecut/components/mobile/BottomTabBar.tsx`, `AppHeader.tsx`
- Create: `wavecut/components/mobile/mobile.module.css`

**Interfaces:**
- Produces: `(mobile)` 공통 셸 — 상단 브랜드 바 + 하단 탭(홈 `/app` / 즐겨찾기 `/app/favorites` / 마이페이지 `/app/mypage`). **알림 탭 없음.**

- [ ] **Step 1: 셸 구현**

`app/(mobile)/layout.tsx` — 390px 컨테이너 + `AppHeader` + `{children}` + `BottomTabBar`. `BottomTabBar`는 현재 경로 기반 active 표시 (Client Component, `usePathname`).

- [ ] **Step 2: 빌드 확인 → Step 3: Commit**

```bash
git add "app/(mobile)/layout.tsx" components/mobile/
git commit -m "feat: add mobile web app shell with bottom tab bar"
```

### Task 5.2: 모바일 홈 + 상세 + 단면 뷰

**Files:**
- Create: `wavecut/app/(mobile)/app/page.tsx`
- Create: `wavecut/app/(mobile)/app/beach/[id]/page.tsx`
- Create: `wavecut/app/(mobile)/app/beach/[id]/xsec/page.tsx`
- Create: `wavecut/components/mobile/AppBeachCard.tsx`, `AppOceanPanel.tsx`

**Interfaces:**
- Consumes: `getAllSummaries`/`getBeachDetail` (2.3), `CrossSection` compact (3.2), `StatusPill` (3.1), `situationTips` (1.3)
- Produces: `/app`, `/app/beach/[id]`, `/app/beach/[id]/xsec`

- [ ] **Step 1: 홈 페이지**

`app/(mobile)/app/page.tsx` — `getAllSummaries`로 인사 헤더 + 오늘의 추천 카드 + 5개 해변 리스트(썸네일 + 이름 + 안전배지 + 날씨·자외선·혼잡 메타). **GPS 없음, 5개 고정.** 정보 위계 준수(쉬운 정보만).

- [ ] **Step 2: 상세 페이지**

`app/(mobile)/app/beach/[id]/page.tsx` — 뒤로가기 앱바 + 쉬운 정보 3칸 + "근처 주차장 보기" 버튼 + `AppOceanPanel`(파고/조위/이안류/가족 2×2, 전문 정보) + "단면 수심 뷰 보기" 버튼.

- [ ] **Step 3: 단면 뷰 페이지**

`app/(mobile)/app/beach/[id]/xsec/page.tsx` — 앱바 + `<CrossSection beach={beach} compact />` + 하단 `SituationTips`.

- [ ] **Step 4: 시각 확인**

Run: `npm run dev` → `/app` → 리스트 → 상세 → 단면 뷰 흐름 확인 (브라우저를 390px로 좁혀서).

- [ ] **Step 5: Commit**

```bash
git add "app/(mobile)/app/page.tsx" "app/(mobile)/app/beach" components/mobile/AppBeachCard.tsx components/mobile/AppOceanPanel.tsx
git commit -m "feat: add mobile home, detail, cross-section pages"
```

### Task 5.3: 즐겨찾기 + 마이페이지 (빈 상태)

**Files:**
- Create: `wavecut/app/(mobile)/app/favorites/page.tsx`
- Create: `wavecut/app/(mobile)/app/mypage/page.tsx`

**Interfaces:**
- Produces: `/app/favorites` (빈 상태), `/app/mypage`

- [ ] **Step 1: 즐겨찾기 빈 상태**

`AppScreens.jsx`의 즐겨찾기 화면 이식 — 아이콘 + "아직 즐겨찾기한 해수욕장이 없습니다" + 설명 + "홈에서 해수욕장 보기" 버튼(`/app` 링크). **샘플 카드 없음.** (즐겨찾기 실제 저장은 MVP 제외)

- [ ] **Step 2: 마이페이지**

`AppScreens.jsx`의 마이페이지 이식 — 사용자 정보 카드 + 리스트(즐겨찾기 관리/데이터 출처 안내/서비스 이용 안내/면책·안전 유의사항) + 면책 문구. **알림 설정·GPS·가족모드 없음.**

- [ ] **Step 3: 시각 확인 + 전체 빌드**

Run: `npm run build`
Expected: 전체 라우트(웹 5 + 앱 5 + api 2) 빌드 성공.

- [ ] **Step 4: Commit**

```bash
git add "app/(mobile)/app/favorites/page.tsx" "app/(mobile)/app/mypage/page.tsx"
git commit -m "feat: add mobile favorites empty state and mypage"
```

---

## Phase 6: Deploy

### Task 6.1: Vercel 배포 + QR 진입점

**Files:**
- Create: `wavecut/app/page.tsx` 검토 (루트 `/`는 이미 웹 대시보드)
- Create: `wavecut/README.md` (실행/배포/환경변수 문서)

**Interfaces:**
- Produces: 공개 URL + QR 코드.

- [ ] **Step 1: 환경변수 문서화**

`wavecut/README.md`에 필요한 환경변수(`DATA_GO_KR_KEY`, `KMA_API_KEY`)와 발급 절차, 로컬 실행(`npm run dev`), 테스트(`npm run test`) 기재.

- [ ] **Step 2: 프로덕션 빌드 검증**

Run: `npm run build && npm run start`
Expected: 로컬 프로덕션 모드에서 `/`, `/app` 정상. API 키 없으면 fallback 데이터로 동작(에러 없이).

- [ ] **Step 3: Vercel 배포**

```bash
npm install -g vercel
vercel --prod
```

Vercel 대시보드에서 환경변수 `DATA_GO_KR_KEY`, `KMA_API_KEY` 등록 후 재배포.

- [ ] **Step 4: QR 확인**

배포 URL(`https://wavecut-xxx.vercel.app/app`)을 QR 코드로 변환(예: `https://api.qrserver.com/v1/create-qr-code/?data=<URL>`). 모바일에서 QR 스캔 → `/app` 진입 확인.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add run/deploy/env documentation"
```

---

## Self-Review

**1. Spec coverage:**
- 스택(Next.js/Route Handler/Vercel/모바일 웹/규칙기반) → Phase 0, 2, 6 ✓
- `/` 웹 + `/app` 모바일 URL 분리 → Phase 4, 5 ✓
- 공공 API 8종 연동 + fallback → Task 2.1~2.3 ✓
- BSM 엔진 이식(levels/profile/aiComment/score) → Phase 1 ✓
- 정보 위계(카드=쉬운정보, 상세=전문정보, 단면뷰 하단=AI코멘트) → Task 3.3(테스트), 4.2, 4.3, 5.2 ✓
- CrossSection 기하 상수/렌더순서 보존 → Task 3.2 + Global Constraints ✓
- 안전 점수 6항목 가중 → Task 1.4 ✓
- 운영자 대시보드 현 수준 유지 → Task 4.4 ✓
- 즐겨찾기 빈 상태/마이페이지 → Task 5.3 ✓
- 디자인 토큰 이식 → Task 0.1 ✓

**2. Placeholder scan:** 코드 단계는 실제 코드 포함. 화면 마크업(Phase 4/5)은 `design_files/*.jsx` 원본 이식을 명시적으로 지시 — 원본이 source of truth이므로 "TODO"가 아니라 "이식 대상 행 번호 지정". 공공 API 응답 스키마는 발급 후 확정되는 외부 의존이라 parseX의 키 경로 조정을 명시.

**3. Type consistency:** `BedProfile`, `TransectParams`, `GridSample`, `AnalyzeResult`, `SafetyStatus`, `TideKey`, `BeachSummary`, `BeachDetail`, `ScoreInput`이 정의처(Phase 1, 2)와 소비처(Phase 3~5)에서 일치. `cssVar`(levels) / `tideOffsets`(aggregate) / `grid`(aggregate) 네이밍 일관.

확인된 갭 없음.
