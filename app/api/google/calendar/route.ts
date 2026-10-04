import { NextRequest, NextResponse } from "next/server";
import { listCalendarView } from "@/lib/google/api";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("vpa_google_access_token")?.value;
  if (!token) return NextResponse.json({ error: "Conecta Google para consultar el calendario." }, { status: 401 });
  const url = new URL(request.url);
  const start = url.searchParams.get("start") || new Date().toISOString();
  const end = url.searchParams.get("end") || new Date(Date.now() + 31 * 86400000).toISOString();
  try { return NextResponse.json(await listCalendarView(token, start, end)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo leer Google Calendar." }, { status: 502 }); }
}

