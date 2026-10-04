import { NextRequest, NextResponse } from "next/server";
import { createGoogleEvent } from "@/lib/google/api";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("vpa_google_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Conecta Google para crear eventos." }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.subject || (body.allDay ? !body.date : (!body.start || !body.end))) return NextResponse.json({ error: body.allDay ? "Falta la fecha del evento." : "Faltan asunto, inicio o fin." }, { status: 400 });
    if (!body.allDay) {
      const start = new Date(body.start);
      const end = new Date(body.end);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return NextResponse.json({ error: "La fecha de inicio o fin no es válida." }, { status: 400 });
      if (end <= start) return NextResponse.json({ error: "La hora de fin debe ser posterior a la hora de inicio." }, { status: 400 });
    }
    return NextResponse.json(await createGoogleEvent(token, body), { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo crear el evento." }, { status: 502 }); }
}

