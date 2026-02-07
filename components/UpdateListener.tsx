"use client";

import { useEffect } from "react";

export default function UpdateListener() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const runUpdate = async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      regs.forEach((reg) => reg.update());
    };

    window.addEventListener("load", runUpdate);
    return () => window.removeEventListener("load", runUpdate);
  }, []);

  return null;
}
