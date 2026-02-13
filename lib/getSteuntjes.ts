import { supabase } from "@/lib/supabase";

export async function getSteuntjes(locale: string) {
  if (!supabase) return null;

  const vandaag = new Date().toISOString().slice(0, 10);

  if (locale === "en") {
    const { data, error } = await supabase
      .from("daily_supports")
      .select("text")
      .eq("date", vandaag)
      .single();

    if (error || !data) return null;

    return data.text;
  }

  // NL
  const { data, error } = await supabase
    .from("steuntjes")
    .select("tekst")
    .eq("datum", vandaag)
    .single();

  if (error || !data) return null;

  return data.tekst;
}
