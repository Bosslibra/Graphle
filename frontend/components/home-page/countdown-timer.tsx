"use client";

import { useEffect, useRef, useState } from "react";

export default function CountdownTimer() {
  const [countdown, setCountdown] = useState<string>("--:--:--");
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      
      const msLeft = midnight.getTime() - now.getTime();
      const s = Math.max(0, Math.floor(msLeft / 1000));
      
      const formatted = [
        Math.floor(s / 3600), 
        Math.floor((s % 3600) / 60), 
        s % 60
      ]
        .map((v) => String(v).padStart(2, "0"))
        .join(":");

      setCountdown(formatted);
    };

    updateCountdown();
    const id = setInterval(updateCountdown, 1000);

    // Ensure timer un-freezes if restored from browser's Back/Forward cache
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        updateCountdown();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <span suppressHydrationWarning className="font-mono font-medium text-foreground tabular-nums">
      {isMounted ? countdown : "--:--:--"}
    </span>
  );
}