import { ConfidentialClientApplication } from "@azure/msal-node";

export const microsoftScopes = [
  "openid",
  "profile",
  "offline_access",
  "User.Read",
  "Calendars.ReadWrite",
  "Chat.Read",
  "ChatMessage.Send",
];

export function isMicrosoftConfigured() {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

export function getMicrosoftClient() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Microsoft Graph no está configurado.");

  return new ConfidentialClientApplication({
    auth: {
      clientId,
      clientSecret,
      authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || "common"}`,
    },
  });
}

export function getMicrosoftRedirectUri() {
  return process.env.MICROSOFT_REDIRECT_URI || "http://localhost:3000/api/microsoft/callback";
}
