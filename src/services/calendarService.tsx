import type { CalendarEvent } from './calendarContext';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Service class for handling calendar-related API operations
 * Manages Google Calendar integration and authentication
 */
class CalendarService {
  /**
   * Retrieves the Google OAuth authorization URL
   * @returns Promise that resolves to the Google auth URL string
   * @throws Error if the request fails
   */
  async getGoogleAuthUrl(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/calendar/google-auth-url`, {
      credentials: 'include', // Include cookies for session management
    });

    if (!response.ok) {
      throw new Error('Failed to get Google auth URL');
    }

    const data = await response.json();
    return data.authUrl;
  }

  /**
   * Exchanges an authorization code for an access token
   * @param code - The authorization code received from Google OAuth
   * @returns Promise that resolves to the access token string
   * @throws Error if the exchange fails
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/calendar/google-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    return data.accessToken;
  }

  /**
   * Imports events from Google Calendar using an access token
   * @param accessToken - The Google Calendar access token
   * @returns Promise that resolves to an array of calendar events
   * @throws Error if the import fails
   */
  async importGoogleCalendar(accessToken: string): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE_URL}/api/calendar/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for session management
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to import Google Calendar');
    }

    const data = await response.json();
    // Map the response data to CalendarEvent objects and ensure dates are Date objects
    return data.events.map((event: CalendarEvent) => ({
      ...event,
      date: new Date(event.date) // Convert date strings to Date objects
    }));
  }
}

// Export a singleton instance of the calendar service
export const calendarService = new CalendarService();