import { NextResponse } from "next/server";
import { isMicrosoftConfigured } from "@/lib/microsoft/config";

export function GET(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const missing = ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET"].filter((name) => !process.env[name]);
  return NextResponse.json({
    configured: isMicrosoftConfigured(),
    connected: cookies.includes("vpa_ms_access_token="),
    missing,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || "http://localhost:3000/api/microsoft/callback",
    scopes: ["Calendars.ReadWrite", "Chat.Read", "ChatMessage.Send"],
  });
}
