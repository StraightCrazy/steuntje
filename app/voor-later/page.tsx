"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VoorLaterPage() {
  const [steuntjes, setSteuntjes] = useState<string[]>([]);

  /* ---------------- Laden ---------------- */
  useEffect(() => {
    const opgeslagen = JSON.parse(
      localStorage.getItem("savedSteuntjes") || "[]"
    ) as string[];

    setSteuntjes(opgeslagen);
  }, []);

  /* ---------------- Verwijderen (loslaten) ---------------- */
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
            <p className="kicker">Voor later</p>
            <h1>Wat je wou bewaren</h1>
          </div>
        </div>

        {steuntjes.length === 0 ? (
          <p className="afsluit-zin">
            Er ligt hier nog niets.
            <br />
            Soms is dat ook oké.
          </p>
        ) : (
          <ul className="saved-list">
            {steuntjes.map((tekst, i) => (
              <li key={i} className="saved-card">
                <p className="saved-text">{tekst}</p>

                <button
                  type="button"
                  className="loslaat-knop"
                  onClick={() => verwijder(i)}
                >
                  loslaten
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="cta-row">
          <Link href="/" className="share-button">
            ← Terug naar vandaag
          </Link>
        </div>
      </section>
    </main>
  );
}
