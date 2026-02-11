export const locales = ["nl", "en"] as const;
export const defaultLocale = "nl";

export type Locale = (typeof locales)[number];
