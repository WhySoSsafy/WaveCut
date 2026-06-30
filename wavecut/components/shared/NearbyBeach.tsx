"use client";

import { useState } from "react";
import Link from "next/link";
import { nearestBeaches, type NearbyBeach as Nearby } from "@/lib/data/geo";
import { BEACH_IDS } from "@/lib/data/fallback";
import { useT } from "@/lib/i18n/LocaleProvider";
import { Icon } from "./Icon";
import styles from "./NearbyBeach.module.css";

function fmt(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

/**
 * Geolocation-powered "nearest beach" finder. Works without any API key.
 * `hrefBase` lets web (/beach) and mobile (/app/beach) link correctly.
 * When location is denied/unavailable it gracefully falls back to the full
 * beach list so the button is never a dead end.
 */
export function NearbyBeach({ hrefBase = "/beach" }: { hrefBase?: string }) {
  const dict = useT();
  const N = dict.nearby;
  const [state, setState] = useState<
    "idle" | "loading" | "done" | "fallback"
  >("idle");
  const [list, setList] = useState<Nearby[]>([]);

  const locate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState("fallback");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setList(nearestBeaches(pos.coords.latitude, pos.coords.longitude));
        setState("done");
      },
      () => setState("fallback"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  // 위치를 받은 경우 — 가까운 순 정렬
  if (state === "done" && list.length > 0) {
    const [top, ...rest] = list;
    return (
      <div className={styles.box}>
        <Link href={`${hrefBase}/${top.id}`} className={styles.top}>
          <span className={styles.topIc}>
            <Icon name="pin" size={18} color="#fff" />
          </span>
          <span className={styles.topMain}>
            <em>{N.nearest}</em>
            <b>
              {dict.beaches[top.id]} · {fmt(top.km)}
            </b>
          </span>
          <Icon name="chevron" size={16} color="var(--ink-3)" />
        </Link>
        <div className={styles.rest}>
          {rest.map((b) => (
            <Link key={b.id} href={`${hrefBase}/${b.id}`} className={styles.restItem}>
              {dict.beaches[b.id]}
              <span className={styles.restKm}>{fmt(b.km)}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // 위치를 못 받은 경우 — 전체 해변 목록으로 폴백 (막다른 오류 대신)
  if (state === "fallback") {
    return (
      <div className={styles.box}>
        <p className={styles.note}>{N.fallbackNote}</p>
        <div className={styles.rest}>
          {BEACH_IDS.map((id) => (
            <Link key={id} href={`${hrefBase}/${id}`} className={styles.restItem}>
              {dict.beaches[id]}
              <Icon name="chevron" size={14} color="var(--ink-3)" />
            </Link>
          ))}
        </div>
        <button className={styles.retry} onClick={locate}>
          <Icon name="pin" size={14} color="var(--blue-600)" />
          {N.retry}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      <button
        className={styles.btn}
        onClick={locate}
        disabled={state === "loading"}
      >
        <Icon name="pin" size={16} color="var(--blue-600)" />
        {state === "loading" ? N.locating : N.find}
      </button>
    </div>
  );
}
