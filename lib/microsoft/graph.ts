const graphBase = "https://graph.microsoft.com/v1.0";

async function graphRequest<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${graphBase}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Microsoft Graph respondió ${response.status}`);
  return payload as T;
}

export type GraphEvent = {
  id: string;
  subject?: string;
  bodyPreview?: string;
  start?: { dateTime?: string; timeZone?: string };
  end?: { dateTime?: string; timeZone?: string };
  webLink?: string;
  onlineMeeting?: { joinUrl?: string };
  isOnlineMeeting?: boolean;
};

export type GraphChat = { id: string; topic?: string; chatType?: string; lastUpdatedDateTime?: string; members?: { displayName?: string; email?: string }[] };
export type GraphMessage = { id: string; createdDateTime?: string; from?: { user?: { displayName?: string; email?: string } }; body?: { content?: string; contentType?: string }; messageType?: string };

export async function listCalendarView(token: string, start: string, end: string) {
  const query = new URLSearchParams({ startDateTime: start, endDateTime: end, $top: "100", $orderby: "start/dateTime" });
  return graphRequest<{ value: GraphEvent[] }>(token, `/me/calendarView?${query.toString()}`);
}

export async function listChats(token: string) {
  return graphRequest<{ value: GraphChat[] }>(token, "/me/chats?$top=50&$expand=members");
}

export async function listChatMessages(token: string, chatId: string) {
  return graphRequest<{ value: GraphMessage[] }>(token, `/chats/${encodeURIComponent(chatId)}/messages?$top=50&$orderby=createdDateTime desc`);
}

export async function createTeamsEvent(token: string, input: { subject: string; body?: string; start: string; end: string; attendeeEmail?: string }) {
  return graphRequest<GraphEvent>(token, "/me/calendar/events", {
    method: "POST",
    body: JSON.stringify({
      subject: input.subject,
      body: { contentType: "HTML", content: input.body || "" },
      start: { dateTime: input.start, timeZone: "UTC" },
      end: { dateTime: input.end, timeZone: "UTC" },
      attendees: input.attendeeEmail ? [{ emailAddress: { address: input.attendeeEmail }, type: "required" }] : [],
      isOnlineMeeting: true,
      onlineMeetingProvider: "teamsForBusiness",
    }),
  });
}

export async function sendChatMessage(token: string, chatId: string, content: string) {
  return graphRequest<{ id: string }>(token, `/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ body: { contentType: "html", content } }),
  });
}
