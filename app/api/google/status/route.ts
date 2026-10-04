import { NextResponse } from "next/server";
import { getGoogleRedirectUri, googleScopes, isGoogleConfigured } from "@/lib/google/config";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const missing = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"].filter((name) => !process.env[name]);
  return NextResponse.json({
    provider: "google",
    configured: isGoogleConfigured(),
    connected: cookies.includes("vpa_google_access_token="),
    missing,
    redirectUri: getGoogleRedirectUri(),
    scopes: googleScopes,
  });
}

