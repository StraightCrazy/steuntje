export type SteuntjeTheme = "rust" | "moed" | "hoop" | "focus";

export type Locale = "nl" | "en";

export type ThemedSteuntje = {
  theme: SteuntjeTheme;
  title: Record<Locale, string>;
  text: Record<Locale, string>;
  miniActie: Record<Locale, string>;
};

export type ResolvedSteuntje = {
  theme: SteuntjeTheme;
  title: string;
  text: string;
  miniActie: string;
};

const steuntjes: ThemedSteuntje[] = [
  {
    theme: "rust",
    title: {
      nl: "Ademruimte",
      en: "Breathing space",
    },
    text: {
      nl: "Je hoeft niet alles tegelijk te dragen. Kies één klein ding dat vandaag genoeg is.",
      en: "You don’t have to carry everything at once. Choose one small thing that is enough for today.",
    },
    miniActie: {
      nl: "Leg je hand op je hart en adem 4 tellen in, 6 tellen uit.",
      en: "Place your hand on your heart and breathe in for 4 counts, out for 6.",
    },
  },

  {
    theme: "moed",
    title: {
      nl: "Kleine stap, groot verschil",
      en: "Small step, big difference",
    },
    text: {
      nl: "Moed is dat je toch één stap zet, ook met bibber in je benen.",
      en: "Courage is taking one step forward, even when your legs are shaking.",
    },
    miniActie: {
      nl: "Schrijf de kleinste volgende stap op en doe die binnen 10 minuten.",
      en: "Write down the smallest next step and do it within 10 minutes.",
    },
  },

  {
    theme: "hoop",
    title: {
      nl: "Lichtpunt",
      en: "A small light",
    },
    text: {
      nl: "Je bent onderweg, zelfs op dagen die zwaar aanvoelen.",
      en: "You are still moving forward, even on heavy days.",
    },
    miniActie: {
      nl: "Noteer 1 ding dat vandaag wél lukte.",
      en: "Write down one thing that went well today.",
    },
  },

  {
    theme: "focus",
    title: {
      nl: "Eén ding tegelijk",
      en: "One thing at a time",
    },
    text: {
      nl: "Geef jezelf toestemming om gewoon te starten.",
      en: "Give yourself permission to just begin.",
    },
    miniActie: {
      nl: "Zet een timer van 12 minuten en werk aan één taak.",
      en: "Set a 12-minute timer and work on one task only.",
    },
  },
];

function hashDay(date: Date): number {
  const key = date.toISOString().slice(0, 10);
  let hash = 0;

  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getThemeOptions() {
  return ["rust", "moed", "hoop", "focus"] as const;
}

export function getFallbackSteuntje(
  locale: Locale = "nl",
  date = new Date()
): ResolvedSteuntje {
  const index = hashDay(date) % steuntjes.length;
  const s = steuntjes[index];

  return {
    theme: s.theme,
    title: s.title[locale],
    text: s.text[locale],
    miniActie: s.miniActie[locale],
  };
}

export function getSteuntjeByTheme(
  theme: SteuntjeTheme,
  locale: Locale = "nl",
  date = new Date()
): ResolvedSteuntje {
  const filtered = steuntjes.filter((s) => s.theme === theme);

  if (filtered.length === 0) {
    return getFallbackSteuntje(locale, date);
  }

  const index = hashDay(date) % filtered.length;
  const s = filtered[index];

  return {
    theme: s.theme,
    title: s.title[locale],
    text: s.text[locale],
    miniActie: s.miniActie[locale],
  };
}
export function getThemeLabels(locale: string = "nl") {

  if (locale === "en") {
    return {
      rust: "Calm",
      moed: "Courage",
      hoop: "Hope",
      focus: "Focus",
    };
  }

  return {
    rust: "Rust",
    moed: "Moed",
    hoop: "Hoop",
    focus: "Focus",
  };
}
