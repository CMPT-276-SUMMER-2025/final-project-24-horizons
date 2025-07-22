const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  location: string;
  type: 'google' | 'canvas' | 'imported';
}

class CalendarService {
  async getGoogleAuthUrl(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/calendar/google-auth-url`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get Google auth URL');
    }

    const data = await response.json();
    return data.authUrl;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/calendar/google-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    return data.accessToken;
  }

  async importGoogleCalendar(accessToken: string): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE_URL}/api/calendar/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to import Google Calendar');
    }

    const data = await response.json();
    return data.events.map((event: any) => ({
      ...event,
      date: new Date(event.date)
    }));
  }
}

export const calendarService = new CalendarService();