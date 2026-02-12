"use client";

import { useLocale } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("app");

  /* ================= DAG / AVOND ================= */
  const [isAvond, setIsAvond] = useState(false);

  useEffect(() => {
    const uur = new Date().getHours();
    const avond = uur >= 20 || uur < 4;
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
  const locale = useLocale();

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
    () => getSteuntjeByTheme(gekozenThema, locale),
    [gekozenThema, locale]
  );

  const tekstVanVandaag = tekstUitDatabase ?? fallbackSteuntje.text;
  const titelVanVandaag = tekstUitDatabase
    ? t("live_support_title")
    : fallbackSteuntje.title;

  const miniActie = fallbackSteuntje.miniActie;

  const audioTekst = `${tekstVanVandaag}. ${
    isAvond
      ? t("closing_evening")
      : t("closing_day")
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
      <section className="hero-card">
        <h1 className="app-title">{t("title")}</h1>

        <h2 className="hero-zin">
          {isAvond ? t("tagline_evening") : t("tagline_day")}
        </h2>

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
            <strong>{t("maybe_this_helps")}</strong> {miniActie}
          </p>

          <p className="afsluit-zin">
            {isAvond ? t("closing_evening") : t("closing_day")}
          </p>

          {isAvond && <AudioSteuntje text={audioTekst} />}
        </article>

        <div className="cta-row">
          <button
            type="button"
            onClick={saveSteuntje}
            className="gevoel-knop save-knop"
          >
            ♡ {t("save_support")}
          </button>

          {opgeslagen && (
            <p className="save-feedback">
              {t("saved_feedback")}
            </p>
          )}

          <ShareButton text={tekstVanVandaag} />
        </div>

        {!hasSupabaseConfig && (
          <p className="setup-hint">
            {t("demo_hint")}
          </p>
        )}
      </section>

      <section id="voor-later" className="support-card">
        <h2>{t("saved_title")}</h2>

        {savedSteuntjes.length === 0 ? (
          <p className="support-intro">
            {t("saved_empty")}
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

      <section className="support-card">
        <h2>
          {isAvond ? t("let_go_title") : t("vent_title")}
        </h2>

        <div className="gevoel-blok">
          <input
            value={gevoel}
            onChange={(e) => setGevoel(e.target.value)}
            placeholder={t("input_placeholder")}
            className="gevoel-input"
          />

          <button
            onClick={verstuurGevoel}
            className="gevoel-knop"
            disabled={loadingAI}
          >
            {loadingAI ? t("listening") : t("give_support")}
          </button>

          {aiAntwoord && (
            <div className="gevoel-antwoord">{aiAntwoord}</div>
          )}
        </div>
      </section>
    </main>
  );
}
