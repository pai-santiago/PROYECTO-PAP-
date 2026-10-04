import { NextResponse } from "next/server";

export function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("vpa_ms_access_token");
  return response;
}
