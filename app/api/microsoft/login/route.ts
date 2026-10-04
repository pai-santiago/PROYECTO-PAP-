import { NextRequest, NextResponse } from "next/server";
import { getMicrosoftClient, getMicrosoftRedirectUri, isMicrosoftConfigured, microsoftScopes } from "@/lib/microsoft/config";

const allowedViews = new Set(["pipeline", "agenda", "conversations", "alerts"]);

function returnView(value: string | null) { return value && allowedViews.has(value) ? value : "agenda"; }

export async function GET(request: NextRequest) {
  const view = returnView(new URL(request.url).searchParams.get("returnTo"));
  if (!isMicrosoftConfigured()) {
    return NextResponse.redirect(new URL(`/?microsoft=missing&view=${view}`, request.url));
  }
  const state = crypto.randomUUID();
  const url = await getMicrosoftClient().getAuthCodeUrl({ scopes: microsoftScopes, redirectUri: getMicrosoftRedirectUri(), state, prompt: "select_account" });
  const response = NextResponse.redirect(url);
  response.cookies.set("vpa_ms_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  response.cookies.set("vpa_ms_return_view", view, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}
