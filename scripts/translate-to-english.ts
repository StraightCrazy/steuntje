import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // BELANGRIJK
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

async function run() {
  console.log("📥 Steuntjes ophalen...");

  const { data, error } = await supabase
    .from("steuntjes")
    .select("datum, tekst");

  if (error) {
    console.error(error);
    return;
  }

  for (const row of data) {
    console.log("🔄 Vertalen:", row.datum);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Translate this Dutch supportive message into natural warm English.",
        },
        {
          role: "user",
          content: row.tekst,
        },
      ],
    });

    const translated = completion.choices[0].message.content;

    await supabase.from("daily_supports").upsert({
      datum: row.datum,
      tekst: translated,
    });
  }

  console.log("✅ Klaar!");
}

run();
