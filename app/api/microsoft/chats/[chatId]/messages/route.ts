import { NextRequest, NextResponse } from "next/server";
import { listChatMessages } from "@/lib/microsoft/graph";

export async function GET(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const token = request.cookies.get("vpa_ms_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Conecta Microsoft 365 para consultar mensajes." }, { status: 401 });
  try { return NextResponse.json(await listChatMessages(token, (await params).chatId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudieron leer los mensajes." }, { status: 502 }); }
}
