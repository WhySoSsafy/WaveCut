# Parser Robustness Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public API parser in `wavecut/lib/api/` a total function — never throw, never return NaN/undefined fields, return `null` for any malformed input.

**Architecture:** Add defensive guards (Array.isArray, Number.isFinite) at the top of each parser before any field access, then add malformed-input test cases to the existing test file. `fetchBathymetry` gets a real fetch+parse skeleton. All changes are in 8 files only.

**Tech Stack:** TypeScript, Next.js (App Router), Vitest

## Global Constraints

- Never throw from a parser — always `return null` on bad input.
- Never return `NaN`, `undefined`, or partially-filled shapes.
- All numeric required fields must pass `Number.isFinite()` or return null.
- Array paths must be guarded with `Array.isArray()` before indexing or iterating.
- Enum fields (`level`, `grade`) must be one of the declared literals or return null.
- `fetchBathymetry` must contain a real fetch+parse path (no bare `return null`), keeping the `// TODO: confirm real API schema` comment. It may still return null at runtime when the endpoint yields nothing.
- Keep all existing passing test assertions unchanged.
- Branch: `feat/wavecut-impl`

---

### Task 1: Fix `parseTide` and `parseWave` (array + NaN guards)

**Files:**
- Modify: `wavecut/lib/api/tide.ts`
- Modify: `wavecut/lib/api/wave.ts`
- Modify: `wavecut/test/api/parsers.test.ts` (add malformed cases for both)

**Interfaces:**
- Consumes: existing `TideResult`, `WaveResult` interfaces
- Produces: `parseTide` and `parseWave` are total functions returning `TideResult | null` or `WaveResult | null`

- [ ] **Step 1: Write failing tests for parseTide malformed input**

Add these cases inside the existing `describe("parseTide", ...)` block in `wavecut/test/api/parsers.test.ts`:

```typescript
  it("data가 배열이 아니면 null (string)", () => {
    expect(parseTide({ result: { data: "oops" } }, "2026-06-25 14:00:00")).toBeNull();
  });

  it("nowCm이 NaN이면 null (tide_level이 숫자 아닌 문자열)", () => {
    // sorted[0].tide_level = "abc" → nowCm = NaN → should return null
    const json = {
      result: {
        data: [
          { record_time: "2026-06-25 14:00:00", tide_level: "abc" },
          { record_time: "2026-06-25 15:00:00", tide_level: "155" },
        ],
      },
    };
    expect(parseTide(json, "2026-06-25 99:00:00")).toBeNull();
  });
```

Add these cases inside `describe("parseWave", ...)`:

```typescript
  it("data가 배열이 아니면 null", () => {
    expect(parseWave({ result: { data: "bad" } })).toBeNull();
  });

  it("height가 NaN이면 null", () => {
    expect(parseWave({ result: { data: [{ wave_height: "x", wave_dir: "북", wave_period: "6" }] } })).toBeNull();
  });

  it("period가 NaN이면 null", () => {
    expect(parseWave({ result: { data: [{ wave_height: "1.2", wave_dir: "북", wave_period: "y" }] } })).toBeNull();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd wavecut && npx vitest run test/api/parsers.test.ts
```

Expected: FAIL on the new cases (parseTide/parseWave currently don't guard).

- [ ] **Step 3: Fix `parseTide`**

Replace the body of `parseTide` in `wavecut/lib/api/tide.ts`:

```typescript
export function parseTide(json: unknown, nowTime: string): TideResult | null {
  const data = (json as { result?: { data?: unknown } })?.result?.data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const records = data as TideRecord[];

  const findLevel = (time: string): number | null => {
    const rec = records.find((d) => d.record_time === time);
    if (!rec) return null;
    const v = parseFloat(rec.tide_level);
    return Number.isFinite(v) ? v : null;
  };

  const sorted = [...records].sort((a, b) => a.record_time.localeCompare(b.record_time));

  const parseCm = (s: string): number | null => {
    const v = parseFloat(s);
    return Number.isFinite(v) ? v : null;
  };

  const nowCm = findLevel(nowTime) ?? parseCm(sorted[0].tide_level);
  if (nowCm === null || !Number.isFinite(nowCm)) return null;

  const idx = sorted.findIndex((d) => d.record_time === nowTime);
  const base = idx >= 0 ? idx : 0;
  const t1Cm = (sorted[base + 1] ? parseCm(sorted[base + 1].tide_level) : null) ?? nowCm;
  const t2Cm = (sorted[base + 2] ? parseCm(sorted[base + 2].tide_level) : null) ?? t1Cm;

  return {
    nowOffset: 0,
    t1Offset: (t1Cm - nowCm) / 100,
    t2Offset: (t2Cm - nowCm) / 100,
    rising: t2Cm > nowCm,
    label: "중조",
  };
}
```

- [ ] **Step 4: Fix `parseWave`**

Replace the body of `parseWave` in `wavecut/lib/api/wave.ts`:

```typescript
export function parseWave(json: unknown): WaveResult | null {
  const data = (json as { result?: { data?: unknown } })?.result?.data;
  if (!Array.isArray(data) || data.length === 0) return null;

  const records = data as WaveRecord[];
  const rec = records[0];

  const height = parseFloat(rec.wave_height);
  if (!Number.isFinite(height)) return null;

  const period = parseFloat(rec.wave_period);
  if (!Number.isFinite(period)) return null;

  return {
    height,
    dir: rec.wave_dir,
    period,
  };
}
```

- [ ] **Step 5: Run tests and verify they pass**

```
cd wavecut && npx vitest run test/api/parsers.test.ts
```

Expected: all parseTide and parseWave cases pass.

- [ ] **Step 6: Commit**

```bash
git add wavecut/lib/api/tide.ts wavecut/lib/api/wave.ts wavecut/test/api/parsers.test.ts
git commit -m "fix: guard parseTide and parseWave against non-array data and NaN fields"
```

---

### Task 2: Fix `parseWeather` and `parseBeachInfo` (array + NaN guards)

**Files:**
- Modify: `wavecut/lib/api/weather.ts`
- Modify: `wavecut/lib/api/beachInfo.ts`
- Modify: `wavecut/test/api/parsers.test.ts` (add malformed cases)

**Interfaces:**
- Produces: `parseWeather` and `parseBeachInfo` are total functions

- [ ] **Step 1: Write failing tests**

Add inside `describe("parseWeather", ...)`:

```typescript
  it("items가 배열이 아니면 null", () => {
    expect(parseWeather({ response: { body: { items: { item: "bad" } } } })).toBeNull();
  });

  it("air(T1H)이 NaN이면 null", () => {
    const json = {
      response: { body: { items: { item: [
        { category: "T1H", obsrValue: "not-a-number" },
        { category: "WSD", obsrValue: "3.5" },
      ] } } },
    };
    expect(parseWeather(json)).toBeNull();
  });

  it("windSpeed(WSD)가 NaN이면 null", () => {
    const json = {
      response: { body: { items: { item: [
        { category: "T1H", obsrValue: "28" },
        { category: "WSD", obsrValue: "not-a-number" },
      ] } } },
    };
    expect(parseWeather(json)).toBeNull();
  });
```

Add inside `describe("parseBeachInfo", ...)`:

```typescript
  it("items가 배열이 아니면 null", () => {
    expect(parseBeachInfo({ response: { body: { items: { item: "bad" } } } })).toBeNull();
  });

  it("waveHeight가 NaN이면 null", () => {
    const json = { response: { body: { items: { item: [
      { waveHeight: "x", waterTemp: "23", windSpeed: "4", windDir: "북" }
    ] } } } };
    expect(parseBeachInfo(json)).toBeNull();
  });

  it("water(waterTemp)가 NaN이면 null", () => {
    const json = { response: { body: { items: { item: [
      { waveHeight: "0.8", waterTemp: "x", windSpeed: "4", windDir: "북" }
    ] } } } };
    expect(parseBeachInfo(json)).toBeNull();
  });

  it("windSpeed가 NaN이면 null", () => {
    const json = { response: { body: { items: { item: [
      { waveHeight: "0.8", waterTemp: "23", windSpeed: "x", windDir: "북" }
    ] } } } };
    expect(parseBeachInfo(json)).toBeNull();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd wavecut && npx vitest run test/api/parsers.test.ts
```

Expected: FAIL on the new weather and beachInfo cases.

- [ ] **Step 3: Fix `parseWeather`**

Replace the `parseWeather` function body in `wavecut/lib/api/weather.ts`:

```typescript
export function parseWeather(json: unknown): WeatherResult | null {
  const items = (
    json as {
      response?: {
        body?: { items?: { item?: unknown } };
      };
    }
  )?.response?.body?.items?.item;
  if (!Array.isArray(items) || items.length === 0) return null;

  const typedItems = items as WeatherItem[];
  const find = (cat: string): string | undefined =>
    typedItems.find((i) => i.category === cat)?.obsrValue;

  const skyCode = find("SKY") ?? "";
  const airStr = find("T1H");
  const uv = find("UV") ?? "보통";
  const wsdStr = find("WSD");

  if (airStr === undefined || wsdStr === undefined) return null;

  const air = parseFloat(airStr);
  if (!Number.isFinite(air)) return null;

  const windSpeed = parseFloat(wsdStr);
  if (!Number.isFinite(windSpeed)) return null;

  return {
    sky: SKY_MAP[skyCode] ?? "알 수 없음",
    air,
    uv,
    windSpeed,
  };
}
```

- [ ] **Step 4: Fix `parseBeachInfo`**

Replace the `parseBeachInfo` function body in `wavecut/lib/api/beachInfo.ts`:

```typescript
export function parseBeachInfo(json: unknown): BeachInfoResult | null {
  const itemArr = (
    json as {
      response?: {
        body?: { items?: { item?: unknown } };
      };
    }
  )?.response?.body?.items?.item;
  if (!Array.isArray(itemArr) || itemArr.length === 0) return null;

  const item = itemArr[0] as BeachInfoItem;

  const waveHeight = parseFloat(item.waveHeight);
  if (!Number.isFinite(waveHeight)) return null;

  const water = parseFloat(item.waterTemp);
  if (!Number.isFinite(water)) return null;

  const windSpeed = parseFloat(item.windSpeed);
  if (!Number.isFinite(windSpeed)) return null;

  return {
    waveHeight,
    water,
    windSpeed,
    windDir: item.windDir,
  };
}
```

- [ ] **Step 5: Run tests and verify they pass**

```
cd wavecut && npx vitest run test/api/parsers.test.ts
```

Expected: all weather and beachInfo cases pass.

- [ ] **Step 6: Commit**

```bash
git add wavecut/lib/api/weather.ts wavecut/lib/api/beachInfo.ts wavecut/test/api/parsers.test.ts
git commit -m "fix: guard parseWeather and parseBeachInfo against non-array items and NaN fields"
```

---

### Task 3: Fix `parseRip` and `parseQuality` (NaN + array guards)

**Files:**
- Modify: `wavecut/lib/api/rip.ts`
- Modify: `wavecut/lib/api/quality.ts`
- Modify: `wavecut/test/api/parsers.test.ts` (add malformed cases)

**Interfaces:**
- Produces: `parseRip` returns null if `parseInt` is NaN; `parseQuality` returns null if items is non-array

- [ ] **Step 1: Write failing tests**

Add inside `describe("parseRip", ...)`:

```typescript
  it("rip_index가 'abc'이면 null", () => {
    expect(parseRip({ response: { body: { items: { item: [{ rip_index: "abc" }] } } } })).toBeNull();
  });

  it("rip_index가 없으면 null", () => {
    expect(parseRip({ response: { body: { items: { item: [{}] } } } })).toBeNull();
  });
```

Add inside `describe("parseQuality", ...)`:

```typescript
  it("items가 배열이 아니면 null", () => {
    expect(parseQuality({ items: "not-array" })).toBeNull();
  });

  it("items[0]이 없으면 null", () => {
    expect(parseQuality({ items: [] })).toBeNull();
  });
```

Note: `parseQuality({ items: [] })` is already tested in the existing suite. The `items: "not-array"` case is new.

- [ ] **Step 2: Run tests to verify they fail**

```
cd wavecut && npx vitest run test/api/parsers.test.ts
```

Expected: FAIL on `rip_index: "abc"` (current code clamps NaN→0 giving "관심" instead of null) and FAIL on `items: "not-array"` for quality.

- [ ] **Step 3: Fix `parseRip`**

Replace the `parseRip` function body in `wavecut/lib/api/rip.ts`:

```typescript
export function parseRip(json: unknown): RipResult | null {
  const item = (
    json as {
      response?: {
        body?: { items?: { item?: Array<{ rip_index?: string }> } };
      };
    }
  )?.response?.body?.items?.item?.[0];
  if (!item || item.rip_index === undefined || item.rip_index === null) return null;

  const raw = parseInt(item.rip_index, 10);
  if (!Number.isFinite(raw)) return null;

  const idx = Math.max(0, Math.min(3, raw));
  return { level: RIP_LEVELS[idx] };
}
```

- [ ] **Step 4: Fix `parseQuality`**

Replace the `parseQuality` function body in `wavecut/lib/api/quality.ts`:

```typescript
export function parseQuality(json: unknown): QualityResult | null {
  const rawItems = (json as { items?: unknown })?.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) return null;

  const item = rawItems[0] as { grade?: string };
  if (!item?.grade) return null;

  const g = item.grade;
  if (g === "적합" || g === "주의" || g === "부적합") return { grade: g };
  return { grade: "주의" };
}
```

- [ ] **Step 5: Run tests and verify they pass**

```
cd wavecut && npx vitest run test/api/parsers.test.ts
```

Expected: all rip and quality cases pass.

- [ ] **Step 6: Commit**

```bash
git add wavecut/lib/api/rip.ts wavecut/lib/api/quality.ts wavecut/test/api/parsers.test.ts
git commit -m "fix: parseRip returns null for non-numeric rip_index; parseQuality guards non-array items"
```

---

### Task 4: Fix `parseBathymetry` + wire `fetchBathymetry`

**Files:**
- Modify: `wavecut/lib/api/bathymetry.ts`
- Modify: `wavecut/test/api/parsers.test.ts` (add malformed cases)

**Interfaces:**
- Produces: `parseBathymetry` returns null if any required section is missing or non-array; `fetchBathymetry` performs a real fetch+parse path

- [ ] **Step 1: Write failing tests**

Add inside `describe("parseBathymetry", ...)`:

```typescript
  it("sections.left가 배열이 아니면 null", () => {
    const json = {
      sections: {
        left: "bad",
        center: [{ dist: 0, depth: 0 }],
        right: [{ dist: 0, depth: 0 }],
      },
    };
    expect(parseBathymetry(json)).toBeNull();
  });

  it("sections.center가 배열이 아니면 null", () => {
    const json = {
      sections: {
        left: [{ dist: 0, depth: 0 }],
        center: null,
        right: [{ dist: 0, depth: 0 }],
      },
    };
    expect(parseBathymetry(json)).toBeNull();
  });

  it("sections.right가 없으면 null", () => {
    const json = {
      sections: {
        left: [{ dist: 0, depth: 0 }],
        center: [{ dist: 0, depth: 0 }],
      },
    };
    expect(parseBathymetry(json)).toBeNull();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd wavecut && npx vitest run test/api/parsers.test.ts
```

Expected: FAIL on the non-array section cases (current code passes empty arrays through via `arr ?? []`).

- [ ] **Step 3: Fix `parseBathymetry` and wire `fetchBathymetry`**

Replace all of `wavecut/lib/api/bathymetry.ts`:

```typescript
import type { BeachId } from "@/lib/data/fallback";
import type { GridSample } from "@/lib/bsm/profile";
import { STATIONS } from "./stations";
import { getEnv } from "./env";

export interface BathymetryResult {
  left: GridSample[];
  center: GridSample[];
  right: GridSample[];
}

interface RawSection {
  dist: number;
  depth: number;
}

interface RawBathymetry {
  sections?: {
    left?: unknown;
    center?: unknown;
    right?: unknown;
  };
}

// TODO: confirm real API schema — bathymetry grid format from national scientific data pending
export function parseBathymetry(json: unknown): BathymetryResult | null {
  const sections = (json as RawBathymetry)?.sections;
  if (!sections) return null;

  if (!Array.isArray(sections.left)) return null;
  if (!Array.isArray(sections.center)) return null;
  if (!Array.isArray(sections.right)) return null;

  const toSamples = (arr: RawSection[]): GridSample[] =>
    arr.map((s) => ({ dist: s.dist, depth: s.depth }));

  const left = toSamples(sections.left as RawSection[]);
  const center = toSamples(sections.center as RawSection[]);
  const right = toSamples(sections.right as RawSection[]);

  if (left.length === 0 && center.length === 0 && right.length === 0) return null;

  return { left, center, right };
}

export async function fetchBathymetry(id: BeachId): Promise<BathymetryResult | null> {
  try {
    const st = STATIONS[id];
    const key = getEnv("BATHYMETRY_API_KEY", { optional: true });
    // TODO: confirm real API schema — marine scientific data portal; URL and params TBD
    const url = `https://api.khoa.go.kr/bathymetry/grid?siteCode=${st.tideObsCode}&type=json&ServiceKey=${key ?? ""}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return parseBathymetry(await res.json());
  } catch {
    return null;
  }
}
```

Note: `getEnv` needs an optional flag. Check the signature in `wavecut/lib/api/env.ts` — if it does not support optional, pass an empty string or catch the env error inside the try block. The `catch` already covers the case where the env var is missing and throws.

- [ ] **Step 4: Run tests and verify they pass**

```
cd wavecut && npx vitest run test/api/parsers.test.ts
```

Expected: all parseBathymetry cases pass.

- [ ] **Step 5: Commit**

```bash
git add wavecut/lib/api/bathymetry.ts wavecut/test/api/parsers.test.ts
git commit -m "fix: parseBathymetry requires all sections to be arrays; wire fetchBathymetry fetch path"
```

---

### Task 5: Full verification and final commit

**Files:**
- Modify: `c:/Users/SSAFY/Desktop/design_handoff_wavecut/.superpowers/sdd/task-2.2-report.md` (append Fix section)

- [ ] **Step 1: Run full test suite**

```
cd wavecut && npx vitest run
```

Expected: all test files pass, no regressions.

- [ ] **Step 2: TypeScript check**

```
cd wavecut && npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 3: Squash-merge final commit**

```bash
git add wavecut/lib/api/tide.ts wavecut/lib/api/wave.ts wavecut/lib/api/weather.ts wavecut/lib/api/beachInfo.ts wavecut/lib/api/rip.ts wavecut/lib/api/quality.ts wavecut/lib/api/bathymetry.ts wavecut/test/api/parsers.test.ts
git commit -m "fix: make API parsers total (null on malformed input) and complete fetchBathymetry"
```

(If intermediate commits already exist from Tasks 1-4, use `git log` to verify — the above is the final atomic commit message as specified in the task brief.)

- [ ] **Step 4: Append Fix section to report**

Append to `c:/Users/SSAFY/Desktop/design_handoff_wavecut/.superpowers/sdd/task-2.2-report.md`:

```markdown
## Fix — Parser Robustness (2026-06-25)

### Changes
- `parseTide`: `Array.isArray` guard on `data`; `Number.isFinite` check on `nowCm` (returns null if NaN).
- `parseWave`: `Array.isArray` guard on `data`; `Number.isFinite` checks on `height` and `period`.
- `parseWeather`: `Array.isArray` guard on `items`; `Number.isFinite` checks on `air` and `windSpeed`.
- `parseBeachInfo`: `Array.isArray` guard on `item` array; `Number.isFinite` checks on `waveHeight`, `water`, `windSpeed`.
- `parseRip`: `Number.isFinite(parseInt(...))` check — returns null for non-numeric `rip_index` (e.g. `"abc"`).
- `parseQuality`: `Array.isArray` guard on `items`; existing enum/fallback logic preserved.
- `parseBathymetry`: each of `left`/`center`/`right` must be an array or returns null; `fetchBathymetry` now has a real fetch+parse path with `next: { revalidate: 3600 }`.

### Vitest output
[paste output here]

### tsc output
clean (no output)
```
