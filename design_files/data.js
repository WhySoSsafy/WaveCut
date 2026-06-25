// ===== 바다안전맵 AI — 데이터 & 체감수심 엔진 =====
(function () {
  // 체감 수심 단계
  const LEVELS = [
    { key: "none",  label: "물 없음",   color: "var(--d-none)",  min: -99, status: "safe" },
    { key: "ankle", label: "발목",      color: "var(--d-ankle)", min: 0,   status: "safe" },
    { key: "knee",  label: "무릎",      color: "var(--d-knee)",  min: 0.3, status: "safe" },
    { key: "waist", label: "허리",      color: "var(--d-waist)", min: 0.6, status: "caution" },
    { key: "chest", label: "가슴",      color: "var(--d-chest)", min: 1.0, status: "caution" },
    { key: "head",  label: "머리 이상", color: "var(--d-head)",  min: 1.5, status: "danger" },
  ];
  function levelOf(depth) {
    if (depth <= 0.02) return LEVELS[0];
    let r = LEVELS[1];
    for (const l of LEVELS) if (depth >= l.min) r = l;
    return r;
  }

  // 시간대 (조위 보정 m)
  const TIMES = [
    { key: "now",  label: "현재",     tide: 0.0,  clock: "14:00" },
    { key: "t1",   label: "1시간 후", tide: 0.35, clock: "15:00" },
    { key: "t2",   label: "2시간 후", tide: 0.70, clock: "16:00" },
  ];

  // 해변 단면 프로파일: 해안선(0m)~바다(80m) 의 해저 깊이(조위0 기준, m)
  // shelf=완만한 모래턱 길이, shelfDepth=모래턱 끝 깊이, slope=급경사 기울기
  function bedDepth(d, t) {
    // d: 해안선으로부터 거리(m), 음수=모래사장
    if (d < 0) return (d / 14) * 0.5; // 모래사장(마른 구간)
    if (d <= t.shelf) return (d / t.shelf) * t.shelfDepth;
    return t.shelfDepth + (d - t.shelf) * t.slope;
  }
  // 연속 드래그용: 두 transect 사이 보간
  function lerpTransect(a, b, f) {
    return {
      shelf: a.shelf + (b.shelf - a.shelf) * f,
      shelfDepth: a.shelfDepth + (b.shelfDepth - a.shelfDepth) * f,
      slope: a.slope + (b.slope - a.slope) * f,
      rip: f < 0.5 ? a.rip : b.rip,
    };
  }
  // position p(0~1) → 보간된 transect 파라미터
  function transectAt(beach, p) {
    const ts = beach.transects;
    const x = p * (ts.length - 1);
    const i = Math.min(Math.floor(x), ts.length - 2);
    return lerpTransect(ts[i], ts[i + 1], x - i);
  }

  // 효과 수심(조위 반영)
  function depthAt(beach, p, tideKey, d) {
    const t = transectAt(beach, p);
    const tm = TIMES.find((x) => x.key === tideKey) || TIMES[0];
    return bedDepth(d, t) + tm.tide;
  }

  // 주요 경계 거리 계산(해안선에서 무릎끝/위험시작까지)
  function analyze(beach, p, tideKey) {
    let kneeEnd = null, dangerStart = null;
    for (let d = 0; d <= 80; d += 0.5) {
      const dep = depthAt(beach, p, tideKey, d);
      if (kneeEnd === null && dep > 0.6) kneeEnd = d;
      if (dangerStart === null && dep >= 1.5) { dangerStart = d; break; }
    }
    return {
      kneeEnd: kneeEnd === null ? 80 : Math.round(kneeEnd),
      dangerStart: dangerStart === null ? null : Math.round(dangerStart),
    };
  }

  // AI 안전 코멘트 (2줄 요약형)
  function aiComment(beach, p, tideKey) {
    const a = analyze(beach, p, tideKey);
    const posName = p < 0.34 ? "좌측" : p < 0.67 ? "중앙" : "우측";
    let body = `현재 선택한 ${posName} 단면은 해안선에서 약 ${a.kneeEnd}m까지 무릎 수심으로 가족 이용에 적합합니다.`;
    if (a.dangerStart) {
      body += ` ${a.dangerStart}m 이후부터 수심이 빠르게 깊어지므로 어린이와 초보자는 주의가 필요합니다.`;
    } else {
      body += ` 측정 구간 전반에서 급격한 수심 변화는 확인되지 않습니다.`;
    }
    return body;
  }

  // 상황별 권장 행동 (가족/초보자/오후방문/혼잡)
  function situationTips(beach, p, tideKey) {
    const a = analyze(beach, p, tideKey);
    const danger = a.dangerStart;
    return [
      { key: "family", icon: "family", s: beach.family ? "safe" : "caution", t: "가족 동반",
        d: `해안선 ${a.kneeEnd}m까지 무릎 이하 수심입니다. 어린이는 이 구간 안에서 보호자와 함께 물놀이하세요.` },
      { key: "begin", icon: "wave", s: danger ? "caution" : "safe", t: "수영 초보자",
        d: danger ? `${danger}m 이후부터 수심이 빠르게 깊어집니다. 구명조끼를 착용하고 안전선 안쪽을 이용하세요.` : `급격한 수심 변화는 없지만 입수 시 항상 안전선 안쪽에 머물러주세요.` },
      { key: "after", icon: "tide", s: "caution", t: "오후 방문 예정",
        d: `오후로 갈수록 조위가 상승해 같은 위치의 체감 수심이 한 단계 깊어집니다. 16시 이후에는 수심을 다시 확인하세요.` },
      { key: "crowd", icon: "crowd", s: beach.crowd === "많음" ? "caution" : "safe", t: "혼잡 시간 방문",
        d: beach.crowd === "많음" ? `현재 혼잡도가 높습니다. 일행과 떨어지지 않도록 하고 안전요원의 안내 구역을 확인하세요.` : `혼잡도가 높지 않아 여유롭게 이용할 수 있습니다.` },
    ];
  }

  // ===== 해수욕장 데이터 =====
  const BEACHES = [
    {
      id: "haeundae", name: "해운대 해수욕장", region: "부산 해운대구",
      score: 86, status: "safe", wave: 0.5, rip: "주의", tide: "중조", tideTrend: "상승",
      water: 23.4, family: true, feature: true, length: 1.5, crowd: "보통",
      sky: "맑음", air: 27, uv: "높음", parking: "해운대 공영주차장", parkDist: "도보 3분",
      summary: "넓고 완만한 모래턱이 가족 물놀이에 적합합니다.",
      transects: [
        { shelf: 28, shelfDepth: 0.7, slope: 0.06, rip: false }, // 좌
        { shelf: 42, shelfDepth: 0.75, slope: 0.05, rip: false }, // 중앙(완만)
        { shelf: 22, shelfDepth: 0.9, slope: 0.11, rip: true },  // 우(이안류)
      ],
    },
    { id: "gwangalli", name: "광안리 해수욕장", region: "부산 수영구",
      score: 78, status: "safe", wave: 0.6, rip: "안전", tide: "중조", tideTrend: "상승",
      water: 23.0, family: true, feature: false, length: 1.4, crowd: "많음",
      sky: "구름조금", air: 26, uv: "보통", parking: "광안리 해변주차장", parkDist: "도보 5분",
      summary: "야간 이용객이 많아 안전요원 안내를 따르세요.",
      transects: [
        { shelf: 24, shelfDepth: 0.8, slope: 0.07, rip: false },
        { shelf: 30, shelfDepth: 0.85, slope: 0.07, rip: false },
        { shelf: 20, shelfDepth: 0.95, slope: 0.1, rip: false },
      ] },
    { id: "songjeong", name: "송정 해수욕장", region: "부산 해운대구",
      score: 69, status: "caution", wave: 1.1, rip: "주의", tide: "대조", tideTrend: "상승",
      water: 22.1, family: false, feature: false, length: 1.2, crowd: "보통",
      sky: "흐림", air: 24, uv: "보통", parking: "송정 공영주차장", parkDist: "도보 4분",
      summary: "파고가 높아 서핑 구역과 물놀이 구역을 구분하세요.",
      transects: [
        { shelf: 18, shelfDepth: 0.9, slope: 0.12, rip: true },
        { shelf: 22, shelfDepth: 0.95, slope: 0.1, rip: false },
        { shelf: 16, shelfDepth: 1.0, slope: 0.14, rip: true },
      ] },
    { id: "songdo", name: "송도 해수욕장", region: "부산 서구",
      score: 82, status: "safe", wave: 0.4, rip: "안전", tide: "소조", tideTrend: "하강",
      water: 23.8, family: true, feature: false, length: 0.8, crowd: "여유",
      sky: "맑음", air: 26, uv: "높음", parking: "송도 해수욕장주차장", parkDist: "도보 2분",
      summary: "내만형 지형으로 파도가 잔잔합니다.",
      transects: [
        { shelf: 30, shelfDepth: 0.7, slope: 0.05, rip: false },
        { shelf: 34, shelfDepth: 0.7, slope: 0.05, rip: false },
        { shelf: 26, shelfDepth: 0.8, slope: 0.07, rip: false },
      ] },
    { id: "dadaepo", name: "다대포 해수욕장", region: "부산 사하구",
      score: 58, status: "caution", wave: 0.9, rip: "위험", tide: "대조", tideTrend: "상승",
      water: 22.6, family: false, feature: false, length: 0.9, crowd: "보통",
      sky: "구름많음", air: 25, uv: "보통", parking: "다대포 해변공영주차장", parkDist: "도보 6분",
      summary: "조수간만 차가 커 갯골·이안류 주의가 필요합니다.",
      transects: [
        { shelf: 40, shelfDepth: 0.6, slope: 0.04, rip: true },
        { shelf: 14, shelfDepth: 1.1, slope: 0.16, rip: true },
        { shelf: 36, shelfDepth: 0.65, slope: 0.05, rip: true },
      ] },
  ];

  const DATA_SOURCES = [
    { name: "국립해양조사원", use: "수심·조위 관측", tag: "조위" },
    { name: "기상청", use: "파고·날씨 예보", tag: "파고" },
    { name: "해양경찰청", use: "이안류 위험 지수", tag: "이안류" },
  ];

  window.BSM = {
    LEVELS, TIMES, BEACHES, DATA_SOURCES,
    levelOf, depthAt, transectAt, analyze, aiComment, situationTips,
    statusLabel: (s) => ({ safe: "안전", caution: "주의", danger: "위험" }[s] || s),
    statusColor: (s) => `var(--${s})`,
  };
})();
