import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { gevoel } = await req.json();

    if (!gevoel || typeof gevoel !== "string") {
      return NextResponse.json(
        { antwoord: "Ik ben hier voor je. Vertel gerust verder." },
        { status: 200 }
      );
    }

    // Simpel warm antwoord (kan later AI worden)
    const antwoord = `Dank je om dit te delen. Wat je voelt mag er zijn. 💛`;

    return NextResponse.json({ antwoord });
  } catch (err) {
    return NextResponse.json(
      { antwoord: "Ik ben hier voor je. Je hoeft het niet alleen te dragen." },
      { status: 200 }
    );
  }
}
