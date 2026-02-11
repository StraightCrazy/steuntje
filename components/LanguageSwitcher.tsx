"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/i18n";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split("/")[1];

  function switchLanguage(locale: string) {
    const segments = pathname.split("/");
    segments[1] = locale; // vervang huidige locale
    const newPath = segments.join("/");
    router.push(newPath);
  }

  return (
    <div className="language-switcher">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLanguage(locale)}
          className={`theme-chip ${
            currentLocale === locale ? "is-active" : ""
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
