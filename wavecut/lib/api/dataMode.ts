/**
 * Whether live public-data keys are configured. Server-only (reads secrets).
 * When keys are absent, the app serves FALLBACK data, so the UI should say so.
 */
export function dataMode(): "live" | "fallback" {
  return process.env.DATA_GO_KR_KEY && process.env.KMA_API_KEY
    ? "live"
    : "fallback";
}
