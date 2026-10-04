import { NextRequest, NextResponse } from "next/server";
import { sendChatMessage } from "@/lib/microsoft/graph";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("vpa_ms_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Conecta Microsoft 365 antes de enviar alertas." }, { status: 401 });
  try {
    const body = await request.json();
    if (!body.chatId || !body.content) return NextResponse.json({ error: "Selecciona un chat y una alerta." }, { status: 400 });
    return NextResponse.json(await sendChatMessage(token, body.chatId, body.content), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo enviar la alerta a Teams." }, { status: 502 });
  }
}
