import "./globals.css";
import type { Metadata } from "next";
import UpdateListener from "@/components/UpdateListener";

export const metadata: Metadata = {
  title: "Steuntje",
  description: "Dagelijkse emotionele EHBO in 20 seconden.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <UpdateListener />
        {children}
      </body>
    </html>
  );
}
