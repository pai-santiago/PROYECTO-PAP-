import { NextRequest, NextResponse } from "next/server";
import { listChats } from "@/lib/microsoft/graph";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("vpa_ms_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Conecta Microsoft 365 para consultar conversaciones." }, { status: 401 });
  try { return NextResponse.json(await listChats(token)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudieron leer los chats." }, { status: 502 }); }
}
