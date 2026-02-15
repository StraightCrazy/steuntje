import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // 1️⃣ Haal alle NL steuntjes op
    const { data: steuntjes, error } = await supabase
      .from("steuntjes")
      .select("datum, tekst");

    if (error) throw error;

    for (const s of steuntjes) {
      // 2️⃣ Vertaal met AI
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Translate this Dutch supportive sentence to warm, natural English.",
          },
          {
            role: "user",
            content: s.tekst,
          },
        ],
      });

      const vertaald = response.choices[0].message.content;

      // 3️⃣ Opslaan in Engelse tabel
      await supabase.from("daily_supports").upsert({
        datum: s.datum,
        tekst: vertaald,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
