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

/* ================= Types ================= */
type ApiResponse = {
  antwoord?: string;
};

type SavedSteuntje = {
  id: string;
  text: string;
  date: string;
};

/* ================= Component ================= */
export default function Home() {
  /* ---------- Dag / Avond ---------- */
  const [isAvond, setIsAvond] = useState(false);

  useEffect(() => {
    const uur = new Date().getHours();
    const avond = uur >= 20 || uur < 6;
    setIsAvond(avond);
    document.body.classList.toggle("avond", avond);
  }, []);

  /* ---------- State ---------- */
  const [tekstUitDatabase, setTekstUitDatabase] = useState<string | null>(null);
  const [gekozenThema, setGekozenThema] = useState<SteuntjeTheme>("rust");
  const [gevoel, setGevoel] = useState("");
  const [aiAntwoord, setAiAntwoord] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [saved, setSaved] = useState<SavedSteuntje[]>([]);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- Init ---------- */
  useEffect(() => {
    getSteuntjeVanVandaag().then(setTekstUitDatabase);
    trackView();

    const lokaal =
      JSON.parse(localStorage.getItem("savedSteuntjes") || "[]") as SavedSteuntje[];
    setSaved(lokaal);
  }, []);

  /* ---------- Adem overlay ---------- */
  const [toonAdem, setToonAdem] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setToonAdem(false), 2600);
    return () => clearTimeout(t);
  }, []);

  /* ---------- Steuntje ---------- */
  const fallbackSteuntje = useMemo(
    () => getSteuntjeByTheme(gekozenThema),
    [gekozenThema]
  );

  const tekstVanVandaag = tekstUitDatabase ?? fallbackSteuntje.text;
  const titelVanVandaag = tekstUitDatabase
    ? "Dit is er nu voor jou"
    : fallbackSteuntje.title;

  const audioTekst = `${tekstVanVandaag}. ${
    isAvond
      ? "Je hoeft vandaag niets meer te dragen. Rust mag nu beginnen."
      : "Dat is genoeg voor nu. Wees zacht voor jezelf vandaag."
  }`;

  /* ---------- Opslaan ---------- */
  function saveSteuntje() {
    const nieuw: SavedSteuntje = {
      id: crypto.randomUUID(),
      text: tekstVanVandaag,
      date: new Date().toISOString(),
    };

    const next = [nieuw, ...saved].slice(0, 20);
    setSaved(next);
    localStorage.setItem("savedSteuntjes", JSON.stringify(next));

    setOpgeslagen(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setOpgeslagen(false), 2200);
  }

  function verwijderSteuntje(id: string) {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    localStorage.setItem("savedSteuntjes", JSON.stringify(next));
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
      setAiAntwoord(
        data.antwoord ??
          "Dank je om dit hier neer te leggen. Het hoeft nergens naartoe."
      );
    } catch {
      const warm = getFallbackSteuntje();
      setAiAntwoord(`Ik ben hier bij je. ${warm.text}`);
    } finally {
      setLoadingAI(false);
    }
  }

  /* ---------- Render ---------- */
  return (
    <>
      {toonAdem && (
        <div className="adem-overlay" aria-hidden>
          <div className="adem-kring" />
        </div>
      )}

      <main className="app-shell">
        {/* ================= STEUNTJE ================= */}
        <section className="hero-card">
          <p className="kicker">Steuntje</p>

          <h1>
            {isAvond
              ? "De dag mag hier even eindigen."
              : "Je hoeft het even niet alleen te dragen."}
          </h1>

          <div className="theme-switcher">
            {getThemeOptions().map((theme) => (
              <button
                key={theme}
                onClick={() => setGekozenThema(theme)}
                className={`theme-chip ${
                  gekozenThema === theme ? "is-active" : ""
                }`}
              >
                {themeLabels[theme]}
              </button>
            ))}
          </div>

          <article className="steuntje-panel">
            <p className="steuntje-subtitle">{titelVanVandaag}</p>
            <p className="steuntje-text">{tekstVanVandaag}</p>

            <p className="afsluit-zin">
              {isAvond
                ? "Rust mag nu beginnen."
                : "Wees zacht voor jezelf vandaag."}
            </p>

            {isAvond && (
              <div className="audio-wrap">
                <AudioSteuntje text={audioTekst} />
              </div>
            )}
          </article>

          <div className="cta-row">
            <button onClick={saveSteuntje} className="gevoel-knop">
              💾 Bewaar dit steuntje
            </button>
            {opgeslagen && (
              <p className="save-feedback">Opgeslagen 💛</p>
            )}
            <ShareButton text={tekstVanVandaag} />
          </div>

          {!hasSupabaseConfig && (
            <p className="setup-hint">Demo-versie</p>
          )}
        </section>

        {/* ================= BEWAARDE ================= */}
        <section className="support-card">
          <h2>Je bewaarde steuntjes</h2>

          {saved.length === 0 && (
            <p className="support-intro">
              Wat je bewaart, verschijnt hier 🌱
            </p>
          )}

          <ul className="saved-list">
            {saved.map((s) => (
              <li key={s.id} className="saved-item">
                <p>{s.text}</p>
                <button
                  onClick={() => verwijderSteuntje(s.id)}
                  aria-label="Verwijder steuntje"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ================= ONDERSTEUNING ================= */}
        <section className="support-card">
          <h2>Wil je iets kwijt?</h2>

          <input
            value={gevoel}
            onChange={(e) => setGevoel(e.target.value)}
            placeholder="Je mag het hier gewoon neerleggen…"
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
        </section>
      </main>
    </>
  );
}
