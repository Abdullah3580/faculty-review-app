// src/components/PingTracker.tsx
"use client";

import { useEffect } from "react";

export default function PingTracker() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/ping", { method: "POST" }).catch(() => {});
    };

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}