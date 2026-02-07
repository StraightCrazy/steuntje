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
  /* ================= DAG / AVOND ================= */
  const [isAvond, setIsAvond] = useState(false);

  useEffect(() => {
    const uur = new Date().getHours();
    const avond = uur >= 20 || uur < 6;
    setIsAvond(avond);
    document.body.classList.toggle("avond", avond);
  }, []);

  /* ================= STATE ================= */
  const [tekstUitDatabase, setTekstUitDatabase] = useState<string | null>(null);
  const [gekozenThema, setGekozenThema] = useState<SteuntjeTheme>("rust");
  const [gevoel, setGevoel] = useState("");
  const [aiAntwoord, setAiAntwoord] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [opgeslagen, setOpgeslagen] = useState(false);
  const [savedSteuntjes, setSavedSteuntjes] = useState<string[]>([]);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ================= INIT ================= */
  useEffect(() => {
    getSteuntjeVanVandaag().then(setTekstUitDatabase);
    trackView();

    const bestaand =
      JSON.parse(localStorage.getItem("savedSteuntjes") || "[]") as string[];
    setSavedSteuntjes(bestaand);
  }, []);

  /* ================= STEUNTJE ================= */
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

  /* ================= OPSLAAN ================= */
  function saveSteuntje() {
    const bestaand =
      JSON.parse(localStorage.getItem("savedSteuntjes") || "[]") as string[];

    if (bestaand.includes(tekstVanVandaag)) {
      setOpgeslagen(true);
      setTimeout(() => setOpgeslagen(false), 1600);
      return;
    }

    const nieuw = [tekstVanVandaag, ...bestaand].slice(0, 30);
    localStorage.setItem("savedSteuntjes", JSON.stringify(nieuw));
    setSavedSteuntjes(nieuw);

    setOpgeslagen(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setOpgeslagen(false), 2200);
  }

  function verwijderSteuntje(index: number) {
    const nieuw = savedSteuntjes.filter((_, i) => i !== index);
    localStorage.setItem("savedSteuntjes", JSON.stringify(nieuw));
    setSavedSteuntjes(nieuw);
  }

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

  /* ================= RENDER ================= */
  return (
    <main className="app-shell">
      {/* ================= STEUNTJE ================= */}
      <section className="hero-card">
        <h1 className="app-title">Steuntje</h1>

        <h1>
          {isAvond
            ? "De dag mag hier even eindigen."
            : "Je hoeft het even niet alleen te dragen."}
        </h1>

        <div className="theme-switcher">
          {getThemeOptions().map((theme) => (
            <button
              key={theme}
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
              ? "Je hoeft vandaag niets meer te dragen."
              : "Dat is genoeg voor nu."}
          </p>

          {isAvond && <AudioSteuntje text={audioTekst} />}
        </article>

        <div className="cta-row">
          <div className="save-row">
            <button
              type="button"
              onClick={saveSteuntje}
              className="gevoel-knop save-knop"
            >
              🤍 Bewaar dit steuntje
            </button>

            <a href="#voor-later" className="voor-later-link">
              Voor later →
            </a>
          </div>

          {opgeslagen && (
            <p className="save-feedback">
              Opgeslagen. Je vindt het terug bij ‘Voor later’ 💛
            </p>
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

      {/* ================= BEWAARD ================= */}
      <section id="voor-later" className="support-card">
        <h2>Voor later bewaard</h2>

        {savedSteuntjes.length === 0 ? (
          <p className="support-intro">
            Wat je bewaart, verschijnt hier. Zonder druk.
          </p>
        ) : (
          <ul className="saved-list">
            {savedSteuntjes.map((tekst, i) => (
              <li key={i} className="saved-item">
                <p>{tekst}</p>
                <button
                  onClick={() => verwijderSteuntje(i)}
                  aria-label="Verwijder steuntje"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ================= GEVOEL ================= */}
      <section className="support-card">
        <h2>{isAvond ? "Wil je de dag loslaten?" : "Wil je iets kwijt?"}</h2>

        <div className="gevoel-blok">
          <input
            value={gevoel}
            onChange={(e) => setGevoel(e.target.value)}
            placeholder="Je mag het hier neerleggen…"
            className="gevoel-input"
          />

          <button
            onClick={verstuurGevoel}
            className="gevoel-knop"
            disabled={loadingAI}
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
