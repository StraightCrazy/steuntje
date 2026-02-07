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
  /* ---------------- Dag / avond ---------------- */
  const [isAvond, setIsAvond] = useState(false);

  useEffect(() => {
    const uur = new Date().getHours();
    const avond = uur >= 20 || uur < 6;
    setIsAvond(avond);
    document.body.classList.toggle("avond", avond);
  }, []);

  /* ---------------- Adem overlay ---------------- */
  const [toonAdem, setToonAdem] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setToonAdem(false), 2800);
    return () => clearTimeout(t);
  }, []);

  /* ---------------- State ---------------- */
  const [tekstUitDatabase, setTekstUitDatabase] = useState<string | null>(null);
  const [gekozenThema, setGekozenThema] = useState<SteuntjeTheme>("rust");
  const [gevoel, setGevoel] = useState("");
  const [aiAntwoord, setAiAntwoord] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [bewaardeSteuntjes, setBewaardeSteuntjes] = useState<string[]>([]);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------------- Init ---------------- */
  useEffect(() => {
    getSteuntjeVanVandaag().then(setTekstUitDatabase);
    trackView();

    const opgeslagen = JSON.parse(
      localStorage.getItem("savedSteuntjes") || "[]"
    ) as string[];

    setBewaardeSteuntjes(opgeslagen);
  }, []);

  /* ---------------- Steuntje ---------------- */
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

  /* ---------------- Opslaan ---------------- */
  function saveSteuntje() {
    const bestaand =
      JSON.parse(localStorage.getItem("savedSteuntjes") || "[]") as string[];

    const nieuw = [tekstVanVandaag, ...bestaand].slice(0, 20);

    localStorage.setItem("savedSteuntjes", JSON.stringify(nieuw));
    setBewaardeSteuntjes(nieuw);

    setOpgeslagen(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => setOpgeslagen(false), 2200);
  }

  /* ---------------- AI ---------------- */
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

  /* ---------------- Render ---------------- */
  return (
    <>
      {toonAdem && (
        <div className="adem-overlay" aria-hidden>
          <div className="adem-kring" />
        </div>
      )}

      <main className="app-shell">
        {/* ========== STEUNTJE ========== */}
        <section className="hero-card">
          <div className="brand-row">
            <span className="brand-mark" aria-hidden>♡</span>
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

            {isAvond && (
              <div className="audio-wrap">
                <p className="audio-hint">
                  Je mag dit ook even laten voorlezen.
                </p>
                <AudioSteuntje text={audioTekst} />
              </div>
            )}
          </article>

          <div className="cta-row">
            <button
              type="button"
              onClick={saveSteuntje}
              className="gevoel-knop"
            >
              💾 Bewaar dit steuntje
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

        {/* ========== BEWAARDE STEUNTJES ========== */}
        {bewaardeSteuntjes.length > 0 && (
          <section className="support-card">
            <h2>Je bewaarde steuntjes</h2>

            <ul className="saved-list">
              {bewaardeSteuntjes.slice(0, 5).map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="saved-item"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ========== ONDERSTEUNING ========== */}
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
                <p className="afsluit-zin">
                  Je hoeft hier niets meer mee te doen.
                </p>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
