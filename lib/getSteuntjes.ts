import { supabase } from "@/lib/supabase";

export async function getSteuntjes(locale: string) {
  if (!supabase) return null;

  const vandaag = new Date().toISOString().slice(0, 10);

  const tabel = locale === "en"
    ? "daily_supports"
    : "steuntjes";

  const kolomDatum = locale === "en"
    ? "date"
    : "datum";

  const kolomTekst = locale === "en"
    ? "text"
    : "tekst";

  const { data, error } = await supabase
    .from(tabel)
    .select(kolomTekst)
    .eq(kolomDatum, vandaag)
    .single();

  if (error || !data) return null;

  return data[kolomTekst];
}
