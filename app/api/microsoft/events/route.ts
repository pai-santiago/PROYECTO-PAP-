import { NextRequest, NextResponse } from "next/server";
import { createTeamsEvent } from "@/lib/microsoft/graph";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("vpa_ms_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Conecta Microsoft 365 para crear reuniones." }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.subject || !body.start || !body.end) return NextResponse.json({ error: "Faltan asunto, inicio o fin." }, { status: 400 });
    return NextResponse.json(await createTeamsEvent(token, body), { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo crear la reunión." }, { status: 502 }); }
}
