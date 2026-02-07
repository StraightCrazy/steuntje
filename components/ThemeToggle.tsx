"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isAvond, setIsAvond] = useState(false);

  // Kleine haptic feedback (mobiel/PWA)
  function haptic() {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
  }

  // Init: voorkeur of tijdstip
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      document.body.classList.add("avond");
      setIsAvond(true);
      return;
    }

    if (saved === "light") {
      document.body.classList.remove("avond");
      setIsAvond(false);
      return;
    }

    // Geen voorkeur → automatisch
    const uur = new Date().getHours();
    const automatischAvond = uur >= 20 || uur < 6;

    document.body.classList.toggle("avond", automatischAvond);
    setIsAvond(automatischAvond);
  }, []);

  function toggleTheme() {
    const next = !isAvond;
    setIsAvond(next);

    document.body.classList.toggle("avond", next);
    localStorage.setItem("theme", next ? "dark" : "light");

    haptic();
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Dag- of nachtmodus"
      title={isAvond ? "Schakel naar dagmodus" : "Schakel naar nachtmodus"}
      className="theme-toggle"
    >
      {isAvond ? "🌙" : "☀️"}
    </button>
  );
}
