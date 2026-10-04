import { NextRequest, NextResponse } from "next/server";
import { getMicrosoftClient, getMicrosoftRedirectUri, isMicrosoftConfigured, microsoftScopes } from "@/lib/microsoft/config";

const allowedViews = new Set(["pipeline", "agenda", "conversations", "alerts"]);

export async function GET(request: NextRequest) {
  const requestedView = request.cookies.get("vpa_ms_return_view")?.value;
  const returnView = requestedView && allowedViews.has(requestedView) ? requestedView : "agenda";
  if (!isMicrosoftConfigured()) return NextResponse.redirect(new URL(`/?microsoft=missing&view=${returnView}`, request.url));
  const { searchParams } = new URL(request.url);
  const oauthError = searchParams.get("error");
  if (oauthError) return NextResponse.redirect(new URL(`/?microsoft=error&view=${returnView}&detail=${encodeURIComponent(searchParams.get("error_description") || oauthError)}`, request.url));
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get("vpa_ms_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) return NextResponse.json({ error: "Estado OAuth inválido." }, { status: 400 });

  try {
    const result = await getMicrosoftClient().acquireTokenByCode({ code, scopes: microsoftScopes, redirectUri: getMicrosoftRedirectUri() });
    if (!result?.accessToken) throw new Error("Microsoft no devolvió un token de acceso.");
    const response = NextResponse.redirect(new URL(`/?microsoft=connected&view=${returnView}`, request.url));
    response.cookies.set("vpa_ms_access_token", result.accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 3500, path: "/" });
    response.cookies.delete("vpa_ms_state");
    response.cookies.delete("vpa_ms_return_view");
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo conectar Microsoft 365." }, { status: 502 });
  }
}
