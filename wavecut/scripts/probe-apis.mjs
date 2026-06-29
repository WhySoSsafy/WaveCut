// 전 소스 실 API 프로브 — .env.local 의 키로 실제 엔드포인트를 호출해 응답을 출력.
// 키는 절대 출력하지 않습니다(.env.local 은 .gitignore). wavecut 폴더에서 실행:
//   node scripts/probe-apis.mjs
//
// data.go.kr 키는 'Encoding'/'Decoding' 두 형태가 있어, raw 와 encodeURIComponent
// 두 방식을 모두 시도해 어느 쪽이 200+데이터를 주는지 진단합니다.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

try {
  const raw = readFileSync(path.join(ROOT, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("!! .env.local 을 읽지 못했습니다. wavecut 폴더에서 실행하세요.");
  process.exit(1);
}

const DGK = (process.env.DATA_GO_KR_KEY ?? "").trim();
const KHOA = (process.env.KHOA_API_KEY ?? "").trim();
console.log(`DATA_GO_KR_KEY: ${DGK ? `set (len ${DGK.length})` : "MISSING"}`);
console.log(`KHOA_API_KEY:   ${KHOA ? `set (len ${KHOA.length})` : "(없음 — 조위/파고/해변정보 KHOA 소스는 건너뜀)"}`);
console.log("");

const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

function sample(text, n = 900) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2).slice(0, n);
  } catch {
    return text.replace(/\s+/g, " ").slice(0, n);
  }
}

async function hit(label, url) {
  process.stdout.write(`\n=== ${label} ===\n`);
  // mask any serviceKey/ServiceKey value in the printed URL
  console.log(url.replace(/([Ss]ervice[Kk]ey=)[^&]+/g, "$1***"));
  try {
    const res = await fetch(url, { headers: UA });
    const text = await res.text();
    console.log(`HTTP ${res.status}`);
    console.log(sample(text));
  } catch (e) {
    console.log(`연결실패: ${e.name} ${e.message}`);
  }
}

// ---- KST 기준 단기예보 base_date/base_time (초단기실황: 매시 40분 발표) ----
const kst = new Date(Date.now() + 9 * 3600 * 1000);
const y = kst.getUTCFullYear();
const mo = String(kst.getUTCMonth() + 1).padStart(2, "0");
const d = String(kst.getUTCDate()).padStart(2, "0");
let hh = kst.getUTCHours();
if (kst.getUTCMinutes() < 40) hh = (hh + 23) % 24; // 40분 이전이면 직전 시각
const base_date = `${y}${mo}${d}`;
const base_time = `${String(hh).padStart(2, "0")}00`;

// 해운대 격자 nx=99, ny=75
async function probeWeather() {
  if (!DGK) return;
  const common = `numOfRows=100&pageNo=1&dataType=JSON&nx=99&ny=75&base_date=${base_date}&base_time=${base_time}`;
  const base =
    "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
  // 1) key 그대로(Encoding 키일 때)
  await hit(
    "기상청 초단기실황 (key 그대로)",
    `${base}?serviceKey=${DGK}&${common}`
  );
  // 2) encodeURIComponent (Decoding 키일 때)
  await hit(
    "기상청 초단기실황 (encodeURIComponent)",
    `${base}?serviceKey=${encodeURIComponent(DGK)}&${common}`
  );
}

async function probeKhoa() {
  if (!KHOA) return;
  await hit(
    "KHOA 조위관측 tideObs (해운대 DT_0063)",
    `https://www.khoa.go.kr/api/oceangrid/tideObs/search.do?ServiceKey=${encodeURIComponent(KHOA)}&ObsCode=DT_0063&ResultType=json`
  );
  await hit(
    "KHOA 해수욕장 정보 (BCH001 해운대)",
    `https://khoa.go.kr/oceandata/api/beach/search.do?ServiceKey=${encodeURIComponent(KHOA)}&BeachCode=BCH001&ResultType=json`
  );
}

await probeWeather();
await probeKhoa();
console.log(
  "\n\n끝. 위 출력(특히 어느 key 방식이 정상 데이터인지, 응답의 item 필드명)을 그대로 붙여주시면 파서를 실응답에 맞춥니다."
);
