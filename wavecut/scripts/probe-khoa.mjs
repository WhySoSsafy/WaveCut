// KHOA 해수욕장 정보 API 확인 프로브.
// 실행:  node scripts/probe-khoa.mjs          (해운대 BCH001)
//        node scripts/probe-khoa.mjs BCH002   (다른 해수욕장 코드 테스트)
// .env.local 의 KHOA_API_KEY 로 진짜 엔드포인트를 호출합니다. 키는 출력하지 않습니다.

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

const KEY = (process.env.KHOA_API_KEY ?? "").trim();
if (!KEY) { console.error("!! KHOA_API_KEY 없음"); process.exit(1); }
console.log(`KHOA_API_KEY 길이: ${KEY.length}\n`);

const beachCode = process.argv[2] || "BCH001"; // 기본: 해운대
const url = `https://khoa.go.kr/oceandata/api/beach/search.do?ServiceKey=${encodeURIComponent(KEY)}&BeachCode=${beachCode}&ResultType=json`;

console.log(`요청: https://khoa.go.kr/oceandata/api/beach/search.do?ServiceKey=***&BeachCode=${beachCode}&ResultType=json\n`);

try {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } });
  const text = await res.text();
  console.log(`HTTP ${res.status}`);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    const isErr = text.includes("국립해양조사원-오류");
    console.log(isErr ? "→ '국립해양조사원-오류' 에러 페이지 (키 미승인/오타 가능성)" : text.replace(/\s+/g, " ").slice(0, 500));
  }
} catch (e) {
  console.log(`연결실패: ${e.name} ${e.message}`);
}
