/**
 * Whether the live public-data key is configured. Server-only (reads secrets).
 * Every fetcher (tide/weather/beachInfo/rip/wave/quality/bathymetry) uses
 * DATA_GO_KR_KEY — that single key is what flips the app from FALLBACK to live.
 */
export function dataMode(): "live" | "fallback" {
  return process.env.DATA_GO_KR_KEY ? "live" : "fallback";
}
