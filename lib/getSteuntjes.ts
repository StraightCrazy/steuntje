import { supabase } from "@/lib/supabase";

export async function getSteuntjes(locale: string) {
  const vandaag = new Date().toISOString().slice(0, 10);

  // 🔁 Kies tabel op basis van taal
  const tabel =
    locale === "en" ? "daily_supports" : "steuntjes";

  const { data, error } = await supabase
    .from(tabel)
    .select("tekst")
    .eq("datum", vandaag)
    .single();

  if (error || !data) {
    console.error("Geen steuntje gevonden:", error);
    return null;
  }

  return data.tekst;
}
