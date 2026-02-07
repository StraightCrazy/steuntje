import { NextResponse } from "next/server";

/* Kleine helper */
function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: Request) {
  try {
    const { gevoel } = await req.json();

    if (!gevoel || typeof gevoel !== "string") {
      return NextResponse.json({
        antwoord: "Ik ben hier voor je. Je mag rustig beginnen, als je wil.",
      });
    }

    const tekst = gevoel.toLowerCase();

    /* ---------------- Toonherkenning ---------------- */
    const isMoe =
      tekst.includes("moe") ||
      tekst.includes("leeg") ||
      tekst.includes("uitgeput");

    const isVerdrietig =
      tekst.includes("verdriet") ||
      tekst.includes("pijn") ||
      tekst.includes("verdrietig") ||
      tekst.includes("eenzaam");

    const isBoos =
      tekst.includes("boos") ||
      tekst.includes("kwaad") ||
      tekst.includes("frustratie");

    const isOnzeker =
      tekst.includes("bang") ||
      tekst.includes("twijfel") ||
      tekst.includes("onzeker") ||
      tekst.includes("angst");

    /* ---------------- Antwoorden ---------------- */
    let antwoord: string;

    if (isMoe) {
      antwoord = pick([
        "Het klinkt alsof je al veel hebt gedragen. Je hoeft nu niets meer op te lossen.",
        "Moe zijn mag. Soms is rust het enige juiste antwoord.",
        "Je mag hier even landen. Dat is genoeg voor dit moment.",
      ]);
    } else if (isVerdrietig) {
      antwoord = pick([
        "Het is oké dat dit pijn doet. Je hoeft hier niet sterk te zijn.",
        "Dank je om dit te delen. Verdriet hoeft niet weg.",
        "Je gevoel mag hier zacht bestaan, zonder uitleg.",
      ]);
    } else if (isBoos) {
      antwoord = pick([
        "Boosheid zegt vaak dat iets belangrijk is. Je mag dat voelen.",
        "Je hoeft dit niet te corrigeren. Het mag er gewoon zijn.",
        "Ook dit gevoel verdient ruimte, zonder oordeel.",
      ]);
    } else if (isOnzeker) {
      antwoord = pick([
        "Het is begrijpelijk dat je twijfelt. Je hoeft nu niets te beslissen.",
        "Bang zijn betekent niet dat je zwak bent.",
        "Je mag dit hier even neerleggen. Dat is genoeg.",
      ]);
    } else {
      antwoord = pick([
        "Dank je om dit hier neer te leggen. Het hoeft nergens naartoe.",
        "Ik lees wat je schrijft. Je hoeft niets te veranderen.",
        "Wat je voelt mag hier rustig blijven liggen.",
      ]);
    }

    return NextResponse.json({ antwoord });
  } catch {
    return NextResponse.json({
      antwoord:
        "Ik ben hier bij je. Zelfs als woorden even moeilijk zijn.",
    });
  }
}
