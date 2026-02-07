"use client";

import { useEffect, useMemo, useState } from "react";
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
  /* ================= Tijd ================= */
  const [isAvond, setIsAvond] = useState(false);

  useEffect(() => {
    const uur = new Date().getHours();
    setIsAvond(uur >= 20 || uur < 6);
  }, []);

  /* ================= State ================= */
  const [tekstUitDatabase, setTekstUitDatabase] = useState<string | null>(null);
  const [gekozenThema, setGekozenThema] = useState<SteuntjeTheme>("rust");
  const [gevoel, setGevoel] = useState("");
  const [aiAntwoord, setAiAntwoord] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  /* ================= Init ================= */
  useEffect(() => {
    getSteuntjeVanVandaag().then(setTekstUitDatabase);
    trackView();
  }, []);

  /* ================= Steuntje ================= */
  const fallbackSteuntje = useMemo(
    () => getSteuntjeByTheme(gekozenThema),
    [gekozenThema]
  );

  const tekstVanVandaag = tekstUitDatabase ?? fallbackSteuntje.text;

  const titelVanVandaag = tekstUitDatabase
    ? "Dit is er nu voor jou"
    : fallbackSteuntje.title;

  const miniActie = fallbackSteuntje.miniActie;

  const audioTekst = `${tekstVanVandaag}. ${
    isAvond
      ? "Je hoeft vandaag niets meer te dragen. Rust mag nu beginnen."
      : "Dat is genoeg voor nu. Wees zacht voor jezelf vandaag."
  }`;

  /* ================= AI ================= */
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

      if (!res.ok) throw new Error("API error");

      const data = (await res.json()) as ApiResponse;

      setAiAntwoord(
        data.antwoord ??
          "Dank je om dit hier neer te leggen. Het hoeft nergens naartoe."
      );
    } catch {
      const warmFallback = getFallbackSteuntje();
      setAiAntwoord(
        `Ik ben hier bij je. ${warmFallback.text} Misschien helpt dit nu: ${warmFallback.miniActie}`
      );
    } finally {
      setLoadingAI(false);
    }
  }

  /* ================= Render ================= */
  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="brand-row">
          <span className="brand-mark" aria-hidden>
            ♡
          </span>
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
              type="button"
              className={`theme-chip ${
                gekozenThema === theme ? "is-active" : ""
              }`}
              onClick={() => setGekozenThema(theme)}
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

          {/* 🔊 AUDIO KNOP */}
          <AudioSteuntje text={audioTekst} />
        </article>

        {!hasSupabaseConfig && (
          <p className="setup-hint">
            Dit is een demo-versie. Je eigen steuntjes verschijnen zodra alles
            gekoppeld is.
          </p>
        )}

        <div className="cta-row">
          <p className="deel-hint">
            Als dit iemand anders kan helpen, mag je het doorgeven.
          </p>
          <ShareButton text={tekstVanVandaag} />
        </div>
      </section>

      <section className="support-card">
        <h2>{isAvond ? "Wil je de dag loslaten?" : "Wil je iets kwijt?"}</h2>

        <p className="support-intro">
          {isAvond
            ? "Je hoeft niets meer op te lossen vanavond."
            : "Je hoeft niets op te lossen. Eén zin is genoeg."}
        </p>

        <div className="gevoel-blok">
          <input
            value={gevoel}
            onChange={(e) => setGevoel(e.target.value)}
            placeholder={
              isAvond
                ? "Je mag het hier laten liggen…"
                : "Je mag het hier gewoon neerleggen…"
            }
            className="gevoel-input"
          />

          <button
            onClick={verstuurGevoel}
            className="gevoel-knop"
            disabled={loadingAI || !gevoel.trim()}
            type="button"
          >
            {loadingAI ? "Ik luister…" : "Geef me een steuntje"}
          </button>

          {aiAntwoord && (
            <>
              <div className="gevoel-antwoord">{aiAntwoord}</div>
              <p className="afsluit-zin">Je hoeft hier niets meer mee te doen.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
