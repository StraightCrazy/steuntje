"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
};

export default function AudioSteuntje({ text }: Props) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  function speak() {
    if (!supported || isSpeaking) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-BE";
    utterance.rate = 0.82;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      className="audio-knop"
      aria-label="Luister naar dit steuntje"
    >
      {isSpeaking ? "Even luisteren…" : "🔊 Luister rustig"}
    </button>
  );
}
