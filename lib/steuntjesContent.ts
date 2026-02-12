export type SteuntjeTheme = "rust" | "moed" | "hoop" | "focus";

export type ThemedSteuntje = {
  theme: SteuntjeTheme;
  title: string;
  text: string;
  miniActie: string;
};

export const themeLabels: Record<SteuntjeTheme, string> = {
  rust: "Rust",
  moed: "Moed",
  hoop: "Hoop",
  focus: "Focus",
};

const steuntjes: ThemedSteuntje[] = [
  {
    theme: "rust",
    title: "Ademruimte",
    text: "Je hoeft niet alles tegelijk te dragen. Kies één klein ding dat vandaag genoeg is, en laat de rest even zachtjes op pauze staan.",
    miniActie: "Leg je hand op je hart en adem 4 tellen in, 6 tellen uit. Herhaal dit 3 keer.",
  },
  {
    theme: "moed",
    title: "Kleine stap, groot verschil",
    text: "Moed is niet dat je nergens bang voor bent. Moed is dat je toch één stap zet, ook met bibber in je benen.",
    miniActie: "Schrijf de kleinste volgende stap op een post-it en doe die binnen 10 minuten.",
  },
  {
    theme: "hoop",
    title: "Lichtpunt",
    text: "Soms voelt vooruitgaan traag. Toch ben je niet stilgevallen: je bent onderweg, zelfs op dagen die zwaar aanvoelen.",
    miniActie: "Noteer 1 ding dat vandaag wél lukte, hoe klein ook.",
  },
  {
    theme: "focus",
    title: "Eén ding tegelijk",
    text: "Je hoofd hoeft niet perfect stil te zijn om te beginnen. Geef jezelf toestemming om gewoon te starten, onvolmaakt en echt.",
    miniActie: "Zet een timer van 12 minuten en werk aan slechts één taak.",
  },
  {
    theme: "rust",
    title: "Zachter voor jezelf",
    text: "Praat tegen jezelf zoals je tegen iemand spreekt die je graag ziet: met mildheid, met geduld, met ruimte.",
    miniActie: "Vervang één strenge gedachte door: ‘Ik ben aan het leren.’",
  },
  {
    theme: "hoop",
    title: "Morgen is nieuw",
    text: "Vandaag hoeft niet perfect te eindigen om morgen mooi te mogen beginnen. Er is altijd een nieuw begin in kleine vormen.",
    miniActie: "Kies nu al 1 fijn startmoment voor morgen (koffie, muziek, korte wandeling).",
  },
  {
    theme: "moed",
    title: "Je doet het toch",
    text: "Ook als niemand ziet hoeveel je probeert: jouw inzet telt. Jouw zachtheid telt. Jouw volhouden telt.",
    miniActie: "Stuur één bericht naar iemand die je vertrouwt: ‘Ik kon vandaag wat steun gebruiken.’",
  },
  {
    theme: "focus",
    title: "Rust in je hoofd",
    text: "Als alles belangrijk lijkt, raakt je energie versnipperd. Kies één prioriteit en bescherm die met aandacht.",
    miniActie: "Zet meldingen 30 minuten uit en maak je belangrijkste taak af.",
  },
];

function hashDay(date: Date): number {
  const key = date.toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getFallbackSteuntje(date = new Date()): ThemedSteuntje {
  const index = hashDay(date) % steuntjes.length;
  return steuntjes[index];
}

export function getThemeOptions() {
  return ["rust", "moed", "hoop", "focus"] as const;
}

export function getSteuntjeByTheme(
  theme: SteuntjeTheme,
  locale: string = "nl",
  date = new Date()
): ThemedSteuntje {
  const filtered = steuntjes.filter((item) => item.theme === theme);

  if (!filtered.length) {
    return getFallbackSteuntje(date);
  }

  const index = hashDay(date) % filtered.length;
  const steun = filtered[index];

  if (locale === "en") {
    return {
      ...steun,
      text: translateToEnglish(steun.text),
      miniActie: translateToEnglish(steun.miniActie),
    };
  }

  return steun;
}


function translateToEnglish(text: string): string {
  // tijdelijke eenvoudige vertaling (later verbeteren)
  return text;
}
