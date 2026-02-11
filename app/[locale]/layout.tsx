import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

const locales = ["nl", "en"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params; // 👈 BELANGRIJK

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="top-controls">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {children}
    </NextIntlClientProvider>
  );
}
