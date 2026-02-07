"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ShareButton from "@/components/ShareButton";
import AudioSteuntje from "@/components/AudioSteuntje";
import { getSteuntjeVanVandaag } from "@/lib/getSteuntjes";
import { trackView } from "@/lib/stats";
import {
  type SteuntjeTheme,
  getFallbackSteuntje,
  getSteuntjeByTheme,
  getThemeOptions,
  themeLabels,
} from "@/lib/steuntjesContent";
import { hasSupabaseConfig } from "@/lib/supabase";

type ApiResponse = {
  antwoord?: string;
};

export default function Home() {
  /* ---------- Dag / avond ---------- */
  const [isAvond, setIsAvond] = useState(false);

  useEffect(() => {
    const uur = new Date().getHours();
    setIsAvond(uur >= 20 || uur < 6);
  }, []);

  /* ---------- State ---------- */
  const [tekstUitDatabase, setTekstUitDatabase] = useState<string | null>(null);
  const [gekozenThema, setGekozenThema] = useState<SteuntjeTheme>("rust");
  const [heeftThemaGekozen, setHeeftThemaGekozen] = useState(false);

  const [gevoel, setGevoel] = useState("");
  const [aiAntwoord, setAiAntwoord] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [opgeslagen, setOpgeslagen] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- Init ---------- */
  useEffect(() => {
    getSteuntjeVanVandaag().then(setTekstUitDatabase);
    trackView();
  }, []);

  /* ---------- Steuntje ---------- */
  const fallbackSteuntje = useMemo(
    () => getSteuntjeByTheme(gekozenThema),
    [gekozenThema]
  );

  const gebruikThema = heeftThemaGekozen || !tekstUitDatabase;

  const tekstVanVandaag = gebruikThema
    ? fallbackSteuntje.text
    : tekstUitDatabase;

  const titelVanVandaag = gebruikThema
    ? fallbackSteuntje.title
    : "Dit is er nu voor jou";

  const miniActie = fallbackSteuntje.miniActie;

  const audioTekst = `${tekstVanVandaag}. ${
    isAvond
      ? "Je hoeft vandaag niets meer te dragen. Rust mag nu beginnen."
      : "Dat is genoeg voor nu. Wees zacht voor jezelf vandaag."
  }`;

  /* ---------- Opslaan ---------- */
  function saveSteuntje() {
    const bestaand =
      JSON.parse(localStorage.getItem("savedSteuntjes") || "[]") as string[];

    const nieuw = [tekstVanVandaag, ...bestaand].slice(0, 20);
    localStorage.setItem("savedSteuntjes", JSON.stringify(nieuw));

    setOpgeslagen(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setOpgeslagen(false), 2200);
  }

  /* ---------- AI ---------- */
  async function verstuurGevoel() {
    if (!gevoel.trim() || loadingAI) return;

    setLoadingAI(true);
    setAiAntwoord(null);

    try {
      const res = await fetch("/api/ik-voel-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gevoel }),
      });

      const data = (await res.json()) as ApiResponse;
      setAiAntwoord(data.antwoord ?? null);
    } catch {
      setAiAntwoord(
        "Dank je om dit hier neer te leggen. Het hoeft nergens naartoe."
      );
    } finally {
      setLoadingAI(false);
    }
  }

  /* ---------- Render ---------- */
  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="brand-row">
          <span className="brand-mark">♡</span>
          <div>
            <p className="kicker">Steuntje</p>
            <h1>
              {isAvond
                ? "De dag mag hier even eindigen."
                : "Je hoeft het even niet alleen te dragen."}
            </h1>
          </div>
        </div>

        <div className="theme-switcher">
          {getThemeOptions().map((theme) => (
            <button
              key={theme}
              className={`theme-chip ${
                gekozenThema === theme ? "is-active" : ""
              }`}
              onClick={() => {
                setGekozenThema(theme);
                setHeeftThemaGekozen(true);
              }}
            >
              {themeLabels[theme]}
            </button>
          ))}
        </div>

        <article className="steuntje-panel">
          <p className="steuntje-subtitle">{titelVanVandaag}</p>
          <p className="steuntje-text">{tekstVanVandaag}</p>

          <p className="mini-actie">
            <strong>Misschien helpt dit nu:</strong> {miniActie}
          </p>

          <p className="afsluit-zin">
            {isAvond
              ? "Je hoeft vandaag niets meer te dragen. Rust mag nu beginnen."
              : "Dat is genoeg voor nu. Wees zacht voor jezelf vandaag."}
          </p>

          {isAvond && (
            <div className="audio-wrap">
              <AudioSteuntje text={audioTekst} />
            </div>
          )}
        </article>

        <div className="cta-row" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <button className="gevoel-knop" onClick={saveSteuntje}>
            ♡ Bewaar dit steuntje
          </button>

          {opgeslagen && (
            <p className="save-feedback">Opgeslagen voor later 💛</p>
          )}

          <ShareButton text={tekstVanVandaag} />
        </div>

        {!hasSupabaseConfig && (
          <p className="setup-hint">
            Dit is een demo-versie. Je eigen steuntjes verschijnen zodra alles
            gekoppeld is.
          </p>
        )}
      </section>

      <section className="support-card">
        <h2>Wil je iets kwijt?</h2>

        <p className="support-intro">
          Je hoeft niets op te lossen. Eén zin is genoeg.
        </p>

        <div className="gevoel-blok">
          <input
            value={gevoel}
            onChange={(e) => setGevoel(e.target.value)}
            placeholder="Je mag het hier gewoon neerleggen…"
            className="gevoel-input"
          />

          <button
            onClick={verstuurGevoel}
            className="gevoel-knop"
            disabled={loadingAI || !gevoel.trim()}
          >
            {loadingAI ? "Ik luister…" : "Geef me een steuntje"}
          </button>

          {aiAntwoord && (
            <div className="gevoel-antwoord">{aiAntwoord}</div>
          )}
        </div>
      </section>
    </main>
  );
}
