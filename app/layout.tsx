import "./globals.css";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Steuntje",
  description: "Een klein moment dat je dag zachter maakt.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
