import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const gevoel = body.gevoel?.trim();

    if (!gevoel) {
      return NextResponse.json({
        antwoord:
          "Ik hoor je. Je hoeft het niet perfect te verwoorden. Wat er is, is genoeg.",
      });
    }

    // 🔹 Prompt ophalen uit Supabase
    const { data: settings } = await supabase
      .from("ai_settings")
      .select("prompt")
      .eq("name", "steuntje_v1")
      .single();

    const systemPrompt =
      settings?.prompt ??
      "Je bent Steuntje. Je reageert warm, menselijk en veilig.";

    // 🔹 AI call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: gevoel,
        },
      ],
      temperature: 0.8,
      max_tokens: 180,
    });

    const antwoord =
      completion.choices[0]?.message?.content ??
      "Ik ben hier bij je. Je hoeft het niet alleen te dragen.";

    return NextResponse.json({ antwoord });
  } catch (error) {
    console.error("AI error:", error);

    return NextResponse.json({
      antwoord:
        "Ik ben hier bij je. Ook als woorden even struikelen. Neem rustig adem.",
    });
  }
}
