// One-time pipeline: download curated Wikimedia Commons beach photos,
// convert to webp (max width 1600, q80) into public/beaches/<id>.webp,
// and write public/beaches/credits.json.
//
// Sources curated from Wikimedia Commons (all free licenses). Re-run with:
//   node scripts/fetch-beach-photos.mjs
//
// Requires: sharp (devDependency).

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "beaches");
const UA = "WaveCut/1.0 (contest MVP; newblueday26@gmail.com)";

// Curated, license-verified Commons images. `download` is a <=1920px thumbnail
// (no need to pull 6000px originals). `source` is the Commons file page.
const SOURCES = {
  haeundae: {
    download:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Haeundae_Beach_in_Busan.jpg/1920px-Haeundae_Beach_in_Busan.jpg",
    credit: {
      author: "StephNurnberg",
      license: "CC-BY-2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0",
      source: "https://commons.wikimedia.org/wiki/File:Haeundae_Beach_in_Busan.jpg",
      title: "Haeundae Beach in Busan.jpg",
    },
  },
  gwangalli: {
    download:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Gwangalli_Beach_and_Gwangan_Bridge_Busan.jpg/1920px-Gwangalli_Beach_and_Gwangan_Bridge_Busan.jpg",
    credit: {
      author: "Masterhatch",
      license: "CC-BY-SA-4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Gwangalli_Beach_and_Gwangan_Bridge_Busan.jpg",
      title: "Gwangalli Beach and Gwangan Bridge Busan.jpg",
    },
  },
  songjeong: {
    download:
      "https://upload.wikimedia.org/wikipedia/commons/a/ad/Songjeong_Beach.jpg",
    credit: {
      author: "Andrewssi2",
      license: "CC-BY-SA-3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:Songjeong_Beach.jpg",
      title: "Songjeong Beach.jpg",
    },
  },
  songdo: {
    download:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Songdo_Beach_Area_and_Namhang_Bridge_in_Busan.jpg/1920px-Songdo_Beach_Area_and_Namhang_Bridge_in_Busan.jpg",
    credit: {
      author: "S h y numis",
      license: "CC-BY-4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0",
      source:
        "https://commons.wikimedia.org/wiki/File:Songdo_Beach_Area_and_Namhang_Bridge_in_Busan.jpg",
      title: "Songdo Beach Area and Namhang Bridge in Busan.jpg",
    },
  },
  dadaepo: {
    download:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Dadaepo_Beach%2C_Busan%2C_Korea.jpg/1920px-Dadaepo_Beach%2C_Busan%2C_Korea.jpg",
    credit: {
      author: "Ken Eckert",
      license: "CC-BY-SA-4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      source: "https://commons.wikimedia.org/wiki/File:Dadaepo_Beach,_Busan,_Korea.jpg",
      title: "Dadaepo Beach, Busan, Korea.jpg",
    },
  },
  ilgwang: {
    download:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/%EC%9D%BC%EA%B4%91%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5.jpg",
    credit: {
      author: "Kma80jihun",
      license: "CC-BY-SA-3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
      source: "https://commons.wikimedia.org/wiki/File:%EC%9D%BC%EA%B4%91%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5.jpg",
      title: "일광해수욕장.jpg",
    },
  },
  // 임랑해수욕장: 위키미디어에 자유 라이선스 사진 없음 → 사진 없이 폴백 처리.
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const credits = {};

  for (const [id, { download, credit }] of Object.entries(SOURCES)) {
    process.stdout.write(`fetching ${id}... `);
    const res = await fetch(download, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    const outPath = join(OUT_DIR, `${id}.webp`);
    const info = await sharp(buf)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);

    credits[id] = { ...credit, width: info.width, height: info.height };
    console.log(`-> ${id}.webp (${info.width}x${info.height})`);
  }

  await writeFile(
    join(OUT_DIR, "credits.json"),
    JSON.stringify(credits, null, 2) + "\n",
  );
  console.log("wrote credits.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
