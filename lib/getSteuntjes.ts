import { supabase } from "@/lib/supabase";

export async function getSteuntjes(locale: string) {
if (!supabase) return null;

const vandaag = new Date().toISOString().slice(0, 10);

const tabel =
locale === "en" ? "daily_supports" : "steuntjes";

const { data, error } = await supabase
.from(tabel)
.select("tekst")
.eq("datum", vandaag)
.eq("language", locale === "en" ? "en" : "nl")
.single();

if (error || !data) return null;

return data.tekst;
}
