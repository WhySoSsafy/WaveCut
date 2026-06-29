export const ko = {
  common: {
    enter: "서비스 들어가기",
    enterArrow: "서비스 들어가기",
    safe: "안전",
    caution: "주의",
    danger: "위험",
    levels: {
      none: "물 없음",
      ankle: "발목",
      knee: "무릎",
      waist: "허리",
      chest: "가슴",
      head: "머리 이상",
    },
  },
  nav: {
    home: "WaveCut 홈",
    dashboard: "메인 대시보드",
    xsec: "단면 수심 뷰",
    operator: "운영자 대시보드",
    transit: "교통·접근성",
    live: "실시간 · 06:00 갱신",
    noticeH: "예측 정보 안내",
    noticeBody: "본 정보는 공공데이터 기반 추정값입니다. 입수 전 현장 안전요원의 안내를 따르세요.",
    demo: "추정 데이터 · 데모",
  },
  landing: {
    kicker: "부산 해수욕장 안전 서비스",
    titleA: "우리 가족 바다,",
    titleB: "지금",
    titleHi: "안전한가요?",
    lede: "수심을 숫자가 아닌 발목·무릎·허리·가슴 체감 단계로. 실시간 공공데이터로 부산 해변의 안전을 한눈에 확인하세요.",
    ctaGhost: "기능 살펴보기 ↓",
    sceneTag: "단면 수심 뷰 — 단면선을 직접 드래그해 보세요",
    problemKicker: "왜 필요할까요",
    problemTitle: "평온해 보이는 바다도, 몇 걸음이면 위험해집니다.",
    problemLede:
      "해운대의 완만한 모래사장도 특정 구간에선 급경사로 수심이 빠르게 깊어지고, 이안류는 어른도 순식간에 먼바다로 끌고 갑니다. WaveCut은 그 보이지 않는 위험을 눈에 보이게 만듭니다.",
    ideaKicker: "핵심 아이디어",
    ideaTitle: "수심을 숫자가 아닌 체감 단계로.",
    ideaLede:
      "“1.2m”는 와닿지 않지만 “가슴까지”는 누구나 압니다. 6단계로 위험을 직관적으로.",
    featKicker: "무엇을 할 수 있나요",
    featTitle: "해변 안전을 위한 네 가지 도구",
    featXsecT: "단면 수심 뷰",
    featXsecD:
      "해변 평면에서 단면선을 드래그하면 위치별 체감 수심과 급경사·위험 구간을 한눈에.",
    featDataT: "실시간 해양 데이터",
    featDataD:
      "기상청·국립해양조사원 공공데이터로 파고·수온·조위·날씨를 실시간 반영.",
    featTransitT: "교통·접근성",
    featTransitD:
      "가장 가까운 역·추천 출구·교통약자 엘리베이터까지, 현장 가는 길을 안내.",
    featOperatorT: "운영자 대시보드",
    featOperatorD: "위험 구간 모니터링과 안전요원 배치 참고, AI 안내문 초안 자동 생성.",
    dataKicker: "추정이 아닌 실데이터",
    dataTitle: "공공데이터를 실시간으로 연동했습니다.",
    dataLede:
      "파고·수온·조위·날씨는 기상청과 국립해양조사원의 공식 API에서 실시간으로 가져옵니다. 데모용 가짜 숫자가 아닙니다.",
    touristKicker: "부산이 처음이세요?",
    touristTitle: "오는 길까지 해변별로 안내합니다.",
    touristLede:
      "가장 가까운 지하철역·추천 출구·교통약자 엘리베이터, 그리고 카카오·네이버 지도 길찾기까지. 관광객도 부산 해변을 쉽게 찾아갈 수 있어요.",
    touristLink: "교통·접근성 보기",
    beachesKicker: "어디를 볼 수 있나요",
    beachesTitle: "부산 6개 해수욕장",
    ctaTitle: "지금 우리 동네 해변을 확인하세요",
    ctaSub: "부산 해수욕장의 체감 수심과 안전 등급을 한눈에.",
    ctaFine:
      "부산시 공공데이터 AI 활용 경진대회 출품작 · 데이터: 기상청 · 국립해양조사원",
  },
  beaches: {
    haeundae: "해운대 해수욕장",
    gwangalli: "광안리 해수욕장",
    songjeong: "송정 해수욕장",
    songdo: "송도 해수욕장",
    dadaepo: "다대포 해수욕장",
    ilgwang: "일광 해수욕장",
  },
};

export type Dict = typeof ko;
