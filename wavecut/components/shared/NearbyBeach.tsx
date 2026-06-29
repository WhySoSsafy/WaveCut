"use client";

import { useState } from "react";
import Link from "next/link";
import { nearestBeaches, type NearbyBeach as Nearby } from "@/lib/data/geo";
import { useT } from "@/lib/i18n/LocaleProvider";
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
  const dict = useT();
  const N = dict.nearby;
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [list, setList] = useState<Nearby[]>([]);
  const [msg, setMsg] = useState("");

  const locate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState("error");
      setMsg(N.unsupported);
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
        if (err.code === err.PERMISSION_DENIED) setMsg(N.errDenied);
        else if (err.code === err.TIMEOUT) setMsg(N.errTimeout);
        else setMsg(N.errUnavail);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
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

  return (
    <div className={styles.box}>
      <button
        className={styles.btn}
        onClick={locate}
        disabled={state === "loading"}
      >
        <Icon name="pin" size={16} color="var(--blue-600)" />
        {state === "loading"
          ? N.locating
          : state === "error"
            ? N.retry
            : N.find}
      </button>
      {state === "error" && <p className={styles.err}>{msg}</p>}
    </div>
  );
}
