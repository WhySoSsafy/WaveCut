"use client";

import { useState } from "react";
import Link from "next/link";
import { nearestBeaches, type NearbyBeach as Nearby } from "@/lib/data/geo";
import { Icon } from "./Icon";
import styles from "./NearbyBeach.module.css";

function fmt(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

/**
 * Geolocation-powered "nearest beach" finder. Works without any API key.
 * `hrefBase` lets web (/beach) and mobile (/app/beach) link correctly.
 */
export function NearbyBeach({ hrefBase = "/beach" }: { hrefBase?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [list, setList] = useState<Nearby[]>([]);
  const [msg, setMsg] = useState("");

  const locate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState("error");
      setMsg("이 브라우저는 위치를 지원하지 않아요.");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setList(nearestBeaches(pos.coords.latitude, pos.coords.longitude));
        setState("done");
      },
      (err) => {
        setState("error");
        setMsg(
          err.code === err.PERMISSION_DENIED
            ? "위치 권한이 거부되었어요. 브라우저 설정에서 허용해 주세요."
            : "위치를 가져오지 못했어요. 잠시 후 다시 시도해 주세요."
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  if (state === "done" && list.length > 0) {
    const [top, ...rest] = list;
    return (
      <div className={styles.box}>
        <Link href={`${hrefBase}/${top.id}`} className={styles.top}>
          <span className={styles.topIc}>
            <Icon name="pin" size={18} color="#fff" />
          </span>
          <span className={styles.topMain}>
            <em>가장 가까운 해변</em>
            <b>
              {top.name} · {fmt(top.km)}
            </b>
          </span>
          <Icon name="chevron" size={16} color="var(--ink-3)" />
        </Link>
        <div className={styles.rest}>
          {rest.map((b) => (
            <Link key={b.id} href={`${hrefBase}/${b.id}`} className={styles.restItem}>
              {b.name}
              <span className={styles.restKm}>{fmt(b.km)}</span>
            </Link>
          ))}
        </div>
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
        {state === "loading" ? "위치 확인 중…" : "내 위치에서 가까운 해변 찾기"}
      </button>
      {state === "error" && <p className={styles.err}>{msg}</p>}
    </div>
  );
}
