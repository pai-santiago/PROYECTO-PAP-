import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthorizationUrl, isGoogleConfigured } from "@/lib/google/config";

const allowedViews = new Set(["pipeline", "agenda", "conversations", "alerts"]);

function returnView(value: string | null) { return value && allowedViews.has(value) ? value : "agenda"; }

export async function GET(request: NextRequest) {
  const view = returnView(new URL(request.url).searchParams.get("returnTo"));
  if (!isGoogleConfigured()) return NextResponse.redirect(new URL(`/?google=missing&view=${view}`, request.url));
  const state = crypto.randomUUID();
  const response = NextResponse.redirect(getGoogleAuthorizationUrl(state));
  response.cookies.set("vpa_google_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  response.cookies.set("vpa_google_return_view", view, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}

