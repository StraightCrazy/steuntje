"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
};

export default function AudioSteuntje({ text }: Props) {
  const [supported, setSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  /* ---------- Support & cleanup ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    setSupported(true);

    const stop = () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stop();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  /* ---------- Toggle speak ---------- */
  function toggleSpeak() {
    if (!supported) return;

    // STOP
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // START
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-BE";
    utterance.rate = document.body.classList.contains("avond") ? 0.78 : 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggleSpeak}
      className="audio-knop"
      aria-pressed={isSpeaking}
      aria-label={
        isSpeaking ? "Stop voorlezen" : "Laat dit steuntje voorlezen"
      }
    >
      {isSpeaking ? "⏸ Stop voorlezen" : "🔊 Laat dit voorlezen"}
    </button>
  );
}
