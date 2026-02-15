import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { gevoel, locale } = await req.json();

    if (!gevoel) {
      return NextResponse.json({ antwoord: "Geen gevoel ontvangen." });
    }

    // 🧠 Slimme taalkeuze
 let taal = "Dutch";

if (locale && locale.startsWith("en")) {
  taal = "English";
}


    const systeemPrompt = `
You are Steuntje, a warm supportive companion.

Reply ONLY in ${taal}.
Use a calm, kind, gentle tone.
Keep the answer short and comforting.
No therapy language.
No long explanations.

Sound like a caring human.
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systeemPrompt },
            { role: "user", content: gevoel },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    const antwoord =
      data.choices?.[0]?.message?.content ??
      "Ik ben hier bij je.";

    return NextResponse.json({ antwoord });
  } catch (error) {
    return NextResponse.json({
      antwoord: "Er ging iets mis, maar ik ben hier.",
    });
  }
}
