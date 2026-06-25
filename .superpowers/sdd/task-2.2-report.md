# Task 2.2 Report — Public API Fetchers with Pure Parsers

## Implemented Modules

| File | Parser | Fetcher | Notes |
|------|--------|---------|-------|
| `lib/api/tide.ts` | `parseTide(json, nowTime)` | `fetchTide(id: BeachId)` | Offset calc in m from cm; sorts records by time |
| `lib/api/rip.ts` | `parseRip(json)` | `fetchRip(id: BeachId)` | Maps rip_index 0–3 → 관심/주의/경계/위험 with clamp |
| `lib/api/quality.ts` | `parseQuality(json)` | `fetchQuality(id: BeachId)` | Grade passthrough; unknown → 주의 fallback |
| `lib/api/weather.ts` | `parseWeather(json)` | `fetchWeather(id: BeachId)` | SKY code map (1→맑음, 2→구름조금, 3→구름많음, 4→흐림); T1H/WSD/UV fields |
| `lib/api/beachInfo.ts` | `parseBeachInfo(json)` | `fetchBeachInfo(id: BeachId)` | waveHeight/waterTemp/windSpeed/windDir from response.body.items.item[0] |
| `lib/api/wave.ts` | `parseWave(json)` | `fetchWave(id: BeachId)` | wave_height/wave_dir/wave_period from result.data[0] |
| `lib/api/bathymetry.ts` | `parseBathymetry(json)` | `fetchBathymetry(id: BeachId)` | Parses sections.{left,center,right} as GridSample[]; fetchBathymetry returns null pending real data |

## TDD Evidence

**RED:** `npx vitest run test/api/parsers.test.ts` → FAIL (Cannot find package '@/lib/api/tide')

**GREEN:** After implementing all 7 modules → `Tests  21 passed (21)` (1 test file)

**Full suite:** `npx vitest run` → `Test Files  6 passed (6)`, `Tests  66 passed (66)` — no regressions.

**TypeScript:** `npx tsc --noEmit` → clean (no output).

## Files Changed

```
wavecut/lib/api/tide.ts          (new)
wavecut/lib/api/rip.ts           (new)
wavecut/lib/api/quality.ts       (new)
wavecut/lib/api/weather.ts       (new)
wavecut/lib/api/beachInfo.ts     (new)
wavecut/lib/api/wave.ts          (new)
wavecut/lib/api/bathymetry.ts    (new)
wavecut/test/api/parsers.test.ts (new)
```

## Self-Review

### Typing
- All 7 `fetchX` functions: `id: BeachId` param (imported from `@/lib/data/fallback`).
- All return types match brief Interfaces block exactly.
- `fetchBathymetry` imports `GridSample` from `@/lib/bsm/profile`.

### Fetcher pattern
- Every `fetchX`: try/catch → returns null on error; `{ next: { revalidate: 3600 } }` on every fetch call; `res.ok` guard.
- `fetchBathymetry` returns null immediately (real endpoint not finalized); `void id` suppresses unused-var warning.

### Parser correctness
- `parseTide`: offset = (tX_cm - now_cm) / 100; `rising` = t2Cm > nowCm; `nowOffset` = 0 by definition.
- `parseRip`: `Math.max(0, Math.min(3, parseInt(...)))` clamps edge cases.
- `parseQuality`: union guard; unrecognized string → "주의".
- All parsers return null for missing/empty data.

### Concerns — Example Schemas Pending Real API Confirmation
The following parsers use **example schemas only** (with `// TODO: confirm real API schema` on each fetchX URL):
- `parseWeather` — KMA Ultra-Short-Range API; category names (SKY, T1H, WSD, UV), SKY code semantics, and UV field format may differ.
- `parseBeachInfo` — beach info API response shape entirely hypothetical until issuance.
- `parseWave` — KHOA wave API; `result.data[0]` structure and field names unconfirmed.
- `parseBathymetry` — `sections.{left,center,right}` format is assumed; real bathymetry data source TBD.
- `parseTide` / `parseRip` — schemas match the brief's examples; still subject to real-API confirmation.

### Brief discrepancy noted
Brief's test asserts `parseRip({ rip_index: "3" })` → `"경계"` but the brief's own `RIP_LEVELS` array maps index 3 → `"위험"`. My implementation and tests use the array (index 3 = "위험"), which is internally consistent. The brief test appears to have a copy-paste error.

## Commit

- SHA: `572a3ca`
- Subject: `feat: add public API fetchers with pure parsers and null fallback`
- Branch: `feat/wavecut-impl`

---

## Fix — Parser Robustness (2026-06-25)

### Changes Applied

- `parseTide`: `Array.isArray` guard on `data`; `Number.isFinite` check on `nowCm` (returns null if NaN).
- `parseWave`: `Array.isArray` guard on `data`; `Number.isFinite` checks on `height` and `period`.
- `parseWeather`: `Array.isArray` guard on `items`; `Number.isFinite` checks on `air` and `windSpeed`.
- `parseBeachInfo`: `Array.isArray` guard on `item` array; `Number.isFinite` checks on `waveHeight`, `water`, `windSpeed`.
- `parseRip`: `Number.isFinite(parseInt(...))` check — returns null for non-numeric `rip_index` (e.g. `"abc"`). 0-input guard via `rip_index === undefined` check (not just falsy).
- `parseQuality`: `Array.isArray` guard on `items`; existing enum/fallback logic preserved.
- `parseBathymetry`: each of `left`/`center`/`right` must be an array or returns null; `fetchBathymetry` now has a real fetch+parse path with `next: { revalidate: 3600 }` using `getEnvOptional("BATHYMETRY_API_KEY")`.

### Vitest output

```
parsers.test.ts: Tests  39 passed (39)
Full suite:      Test Files  6 passed (6), Tests  84 passed (84)
```

### tsc output

clean (no output)

### Commit

- SHA: `a4a6629`
- Subject: `fix: make API parsers total (null on malformed input) and complete fetchBathymetry`
- Branch: `feat/wavecut-impl`

---

## Fix 2 — Total Parser Contract (2026-06-25)

### Changes Applied

1. **Null element guards in array-based parsers:**
   - `parseTide`: filters out non-object elements before sorting; `findLevel` skips null entries; `sorted[base+1]`/`[base+2]` null-checked before field access.
   - `parseWeather`: `find()` helper guards each item with `x != null && typeof x === "object"` before accessing `.category`/`.obsrValue`.
   - `parseBeachInfo`: `itemArr[0]` checked `!= null && typeof === "object"` before cast; throws never on null element.
   - `parseWave`: `data[0]` checked `!= null && typeof === "object"` before cast.
   - `parseBathymetry`: `toSamples` iterates with `isValidSample` guard per element; any null/non-object/non-finite sample causes the whole section to return `null`.

2. **parseBathymetry sample validation:** `isValidSample` requires `Number.isFinite(s.dist) && Number.isFinite(s.depth)` for every sample. Missing `depth` or `NaN`/`Infinity` → returns `null` for that section → `parseBathymetry` returns `null`. Each required section must be non-empty.

3. **String field defaults:** `parseBeachInfo` returns `windDir: ""` if field is absent/non-string. `parseWave` returns `dir: ""` if `wave_dir` is absent/non-string.

4. **parseRip strict numeric:** replaced `parseInt` with a `/^\d+$/` test on `String(rip_index).trim()`. Accepts only clean non-negative integer strings. `"-5"`, `"1abc"`, `""`, null, undefined → `null`. `"0"` → "관심". `"99"` → clamped to "위험". Existing test for `-5`→"관심" updated to expect `null` (new contract).

5. **`Number.isFinite` discipline:** all numeric fields in all parsers consistently use `Number.isFinite` after `parseFloat`.

### New Test Cases Added

- `parseTide` with `[null]` first element → null, no throw
- `parseWeather` with `[null]` first element → null, no throw
- `parseBeachInfo` with `[null]` first element → null, no throw
- `parseWave` with `[null]` first element → null, no throw
- `parseBathymetry` with null element in left → null, no throw
- `parseBathymetry` with `[{ dist: 1 }]` (missing depth) → null
- `parseBathymetry` with `[{ dist: 1, depth: NaN }]` → null
- `parseRip` with `"1abc"` → null
- `parseRip` with `"-5"` → null (was: "관심"; updated per strict contract)
- `parseBeachInfo` missing windDir → `result.windDir === ""`
- `parseWave` missing wave_dir → `result.dir === ""`

### Vitest output

```
parsers.test.ts: Tests  51 passed (51)
Full suite:      Test Files  6 passed (6), Tests  96 passed (96)
```

### tsc output

clean (no output)

### Commit

- SHA: `97a7b76`
- Subject: `fix: fully harden API parsers against malformed input (total parser contract)`
- Branch: `feat/wavecut-impl`

---

## Fix 3 — parseTide Record Validation (2026-06-25)

### Changes Applied

- `parseTide`: Added filter before sort to ensure only records with `typeof record_time === "string"` AND `record.tide_level != null` are processed. Prevents `.localeCompare()` and `parseFloat()` calls on invalid records. Returns `null` if no usable records remain after filtering.

### Test case added

```ts
it("record_time이 비문자열인 레코드가 있어도 throw하지 않고 처리한다", () => {
  expect(() => parseTide({ result: { data: [{ record_time: 123, tide_level: "100" }] } }, "2026-06-25 14:00:00")).not.toThrow();
  expect(parseTide({ result: { data: [{}] } }, "2026-06-25 14:00:00")).toBeNull();
  expect(parseTide({ result: { data: [{ record_time: 123, tide_level: "100" }] } }, "2026-06-25 14:00:00")).toBeNull();
});
```

### Vitest output

```
parsers.test.ts: Tests  52 passed (52)
Full suite:      Test Files  6 passed (6), Tests  97 passed (97)
```

### tsc output

clean (no output)

### Commit

- SHA: `6efed7f`
- Subject: `fix: parseTide ignores records with non-string record_time (never throws)`
- Branch: `feat/wavecut-impl`
