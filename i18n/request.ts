import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "../i18n";

export default getRequestConfig(async ({ locale }) => {
  const currentLocale =
    locale && locales.includes(locale as any)
      ? locale
      : defaultLocale;

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default,
  };
});
