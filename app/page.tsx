"use client";

import { useEffect, useMemo, useState } from "react";
import ShareButton from "@/components/ShareButton";
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
  const [tekstUitDatabase, setTekstUitDatabase] = useState<string | null>(null);
  const [gekozenThema, setGekozenThema] = useState<SteuntjeTheme>("rust");
  const [gevoel, setGevoel] = useState("");
  const [aiAntwoord, setAiAntwoord] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    getSteuntjeVanVandaag().then(setTekstUitDatabase);
    trackView();
  }, []);

  const fallbackSteuntje = useMemo(
    () => getSteuntjeByTheme(gekozenThema),
    [gekozenThema]
  );

  const tekstVanVandaag = tekstUitDatabase ?? fallbackSteuntje.text;
  const titelVanVandaag = tekstUitDatabase
    ? "Voor jou vandaag"
    : fallbackSteuntje.title;

  const miniActie = fallbackSteuntje.miniActie;

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
      setAiAntwoord(data.antwoord ?? "Ik ben er voor je.");
    } catch {
      const warmFallback = getFallbackSteuntje();
      setAiAntwoord(
        `Ik ben er voor je. ${warmFallback.text} Probeer dit nu: ${warmFallback.miniActie}`
      );
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="brand-row">
          <span className="brand-mark" aria-hidden>
            ♡
          </span>
          <div>
            <p className="kicker">Steuntje</p>
            <h1>Een klein moment dat je dag zachter maakt.</h1>
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
            <strong>Mini-actie:</strong> {miniActie}
          </p>
        </article>

        {!hasSupabaseConfig && (
          <p className="setup-hint">
            Demo-modus actief: voeg je Supabase keys toe in `.env.local`.
          </p>
        )}

        <div className="cta-row">
          <ShareButton text={tekstVanVandaag} />
        </div>
      </section>

      <section className="support-card">
        <h2>Vertel even hoe je je voelt</h2>
        <p className="support-intro">
          Schrijf één zin. Je krijgt meteen een warm antwoord terug.
        </p>

        <div className="gevoel-blok">
          <input
            value={gevoel}
            onChange={(e) => setGevoel(e.target.value)}
            placeholder="Bijv. ik ben moe en overprikkeld…"
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
            <div className="gevoel-antwoord">{aiAntwoord}</div>
          )}
        </div>
      </section>
    </main>
  );
}
