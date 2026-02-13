import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  console.log("🌿 Ophalen NL steuntjes...");

  const { data: steuntjes, error } = await supabase
    .from("steuntjes")
    .select("*")
    .eq("language", "nl");

  if (error) {
    console.error(error);
    return;
  }

  for (const s of steuntjes!) {
    console.log("Vertalen:", s.tekst);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Translate this Dutch supportive sentence into warm, gentle English for a wellbeing app. Keep emotional tone soft and caring.",
        },
        {
          role: "user",
          content: s.tekst,
        },
      ],
    });

    const translated = completion.choices[0].message.content;

    await supabase.from("steuntjes").insert({
      datum: s.datum,
      tekst: translated,
      language: "en",
    });

    console.log("✅ Opgeslagen EN versie");
  }

  console.log("🎉 Klaar!");
}

run();
