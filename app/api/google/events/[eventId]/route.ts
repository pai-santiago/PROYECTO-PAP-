import { NextRequest, NextResponse } from "next/server";
import { updateGoogleEvent } from "@/lib/google/api";

export async function PATCH(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const token = request.cookies.get("vpa_google_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Conecta Google para mover eventos." }, { status: 401 });
  try {
    const body = await request.json();
    const { eventId } = await context.params;
    if (body.allDay && !body.date) return NextResponse.json({ error: "Falta la fecha del evento." }, { status: 400 });
    if (!body.allDay && (!body.start || !body.end || new Date(body.end) <= new Date(body.start))) return NextResponse.json({ error: "La hora de fin debe ser posterior a la hora de inicio." }, { status: 400 });
    return NextResponse.json(await updateGoogleEvent(token, eventId, body));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo mover el evento." }, { status: 502 }); }
}
