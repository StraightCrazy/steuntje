"use client";

import { useEffect, useState } from "react";
import AudioSteuntje from "@/components/AudioSteuntje";

export default function SavedSteuntjes() {
  const [steuntjes, setSteuntjes] = useState<string[]>([]);

  useEffect(() => {
    const opgeslagen =
      JSON.parse(localStorage.getItem("savedSteuntjes") || "[]") as string[];
    setSteuntjes(opgeslagen);
  }, []);

  function verwijder(index: number) {
    const nieuw = steuntjes.filter((_, i) => i !== index);
    setSteuntjes(nieuw);
    localStorage.setItem("savedSteuntjes", JSON.stringify(nieuw));
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
            <h1>Mijn bewaarde steuntjes</h1>
          </div>
        </div>

        {steuntjes.length === 0 ? (
          <p className="afsluit-zin">
            Je hebt nog geen steuntjes bewaard.  
            Als iets je raakt, mag je het bewaren voor later.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {steuntjes.map((tekst, i) => (
              <article key={i} className="steuntje-panel">
                <p className="steuntje-text">{tekst}</p>

                <div className="audio-wrap">
                  <AudioSteuntje text={tekst} />
                </div>

                <button
                  className="audio-knop"
                  onClick={() => verwijder(i)}
                >
                  🗑 Verwijder
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
