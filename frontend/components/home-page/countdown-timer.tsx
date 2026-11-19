"use client";

import { useEffect, useState } from "react";
import { msUntilNextDaily } from "@/lib/graph/random";

function format(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

/** Time left until the daily puzzles change (midnight UTC, same moment for everyone). */
export default function CountdownTimer() {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setCountdown(format(msUntilNextDaily()));
    const id = setInterval(tick, 1000);
    const first = setTimeout(tick, 0);
    // Un-freeze when restored from the back/forward cache or a background tab
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      clearTimeout(first);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <span className="font-mono font-medium tabular-nums text-foreground">{countdown ?? "--:--:--"}</span>
  );
}
