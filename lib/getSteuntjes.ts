import { supabase, hasSupabaseConfig } from "./supabase";

export async function getSteuntjeVanVandaag(): Promise<string | null> {
  if (!hasSupabaseConfig || !supabase) {
    return null;
  }

  const vandaag = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("steuntjes")
    .select("tekst")
    .eq("datum", vandaag)
    .single();

  if (error || !data) {
    return null;
  }

  return data.tekst;
}
