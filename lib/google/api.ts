const calendarBase = "https://www.googleapis.com/calendar/v3";

async function googleRequest<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${calendarBase}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Google Calendar respondió ${response.status}`);
  return payload as T;
}

type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  hangoutLink?: string;
  start?: { date?: string; dateTime?: string; timeZone?: string };
  end?: { date?: string; dateTime?: string; timeZone?: string };
};

export type CalendarEvent = {
  id: string;
  subject?: string;
  bodyPreview?: string;
  allDay?: boolean;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  webLink?: string;
  onlineMeeting?: { joinUrl?: string };
};

function normalizeEvent(event: GoogleCalendarEvent): CalendarEvent {
  return {
    id: event.id,
    subject: event.summary,
    bodyPreview: event.description,
    allDay: Boolean(event.start?.date),
    start: { date: event.start?.date, dateTime: event.start?.dateTime },
    end: { date: event.end?.date, dateTime: event.end?.dateTime },
    webLink: event.htmlLink,
    onlineMeeting: { joinUrl: event.hangoutLink },
  };
}

function calendarDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function nextDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export async function listCalendarView(token: string, start: string, end: string) {
  const events: GoogleCalendarEvent[] = [];
  let pageToken = "";
  do {
    const query = new URLSearchParams({ timeMin: start, timeMax: end, singleEvents: "true", orderBy: "startTime", maxResults: "2500" });
    if (pageToken) query.set("pageToken", pageToken);
    const result = await googleRequest<{ items?: GoogleCalendarEvent[]; nextPageToken?: string }>(token, `/calendars/primary/events?${query.toString()}`);
    events.push(...(result.items || []));
    pageToken = result.nextPageToken || "";
  } while (pageToken);
  return { value: events.map(normalizeEvent) };
}

export async function createGoogleEvent(token: string, input: { subject: string; body?: string; start?: string; end?: string; date?: string; allDay?: boolean; attendeeEmail?: string }) {
  const attendees = input.attendeeEmail ? [{ email: input.attendeeEmail }] : [];
  const timing = input.allDay ? { start: { date: input.date }, end: { date: nextDate(input.date as string) } } : { start: { dateTime: calendarDateTime(input.start as string), timeZone: "America/Cancun" }, end: { dateTime: calendarDateTime(input.end as string), timeZone: "America/Cancun" } };
  const result = await googleRequest<GoogleCalendarEvent>(token, "/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all", {
    method: "POST",
    body: JSON.stringify({
      summary: input.subject,
      description: input.body || "",
      ...timing,
      attendees,
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    }),
  });
  return normalizeEvent(result);
}

export async function updateGoogleEvent(token: string, eventId: string, input: { date?: string; start?: string; end?: string; allDay?: boolean }) {
  const timing = input.allDay ? { start: { date: input.date }, end: { date: nextDate(input.date as string) } } : { start: { dateTime: calendarDateTime(input.start as string), timeZone: "America/Cancun" }, end: { dateTime: calendarDateTime(input.end as string), timeZone: "America/Cancun" } };
  const result = await googleRequest<GoogleCalendarEvent>(token, `/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=all`, { method: "PATCH", body: JSON.stringify(timing) });
  return normalizeEvent(result);
}

