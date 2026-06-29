/** External map deep-links (no API key needed — public web search URLs). */
export function kakaoMapSearch(query: string): string {
  return `https://map.kakao.com/?q=${encodeURIComponent(query)}`;
}

export function naverMapSearch(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}
