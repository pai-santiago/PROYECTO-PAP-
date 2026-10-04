import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, getGoogleRedirectUri, isGoogleConfigured } from "@/lib/google/config";

const allowedViews = new Set(["pipeline", "agenda", "conversations", "alerts"]);

export async function GET(request: NextRequest) {
  const requestedView = request.cookies.get("vpa_google_return_view")?.value;
  const returnView = requestedView && allowedViews.has(requestedView) ? requestedView : "agenda";
  if (!isGoogleConfigured()) return NextResponse.redirect(new URL(`/?google=missing&view=${returnView}`, request.url));
  const { searchParams } = new URL(request.url);
  const oauthError = searchParams.get("error");
  if (oauthError) return NextResponse.redirect(new URL(`/?google=error&view=${returnView}&detail=${encodeURIComponent(searchParams.get("error_description") || oauthError)}`, request.url));
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get("vpa_google_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) return NextResponse.json({ error: "Estado OAuth inválido." }, { status: 400 });

  try {
    const result = await exchangeGoogleCode(code);
    const response = NextResponse.redirect(new URL(`/?google=connected&view=${returnView}`, request.url));
    response.cookies.set("vpa_google_access_token", result.access_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: result.expires_in || 3500, path: "/" });
    if (result.refresh_token) response.cookies.set("vpa_google_refresh_token", result.refresh_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
    response.cookies.delete("vpa_google_state");
    response.cookies.delete("vpa_google_return_view");
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : `No se pudo conectar Google. Redirección: ${getGoogleRedirectUri()}` }, { status: 502 });
  }
}

