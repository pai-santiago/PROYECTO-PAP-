import { NextResponse } from "next/server";

export function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("vpa_google_access_token");
  response.cookies.delete("vpa_google_refresh_token");
  return response;
}

