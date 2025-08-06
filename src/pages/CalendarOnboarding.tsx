import React, { useState } from 'react';
import './CalendarOnboarding.css';
import Navbar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import { useCalendar } from '../services/calendarContext';
import { useGoals } from '../services/goalsContext';
import type { CalendarEvent } from '../services/calendarContext';
import { GraduationCap, CalendarPlus, MailPlus, Check } from 'lucide-react';

// Global type declaration for Google APIs
declare global {
  interface Window {
    gapi: unknown;
    google: unknown;
  }
}

/**
 * CalendarOnboarding Component
 * 
 * This component handles the initial setup of user calendars and goals.
 * It provides functionality to:
 * - Import Canvas academic calendars via ICS URLs
 * - Connect Google Calendar through OAuth
 * - Import other calendar services via ICS URLs
 * - Add and manage personal goals
 * - Preview imported events in a calendar view
 */
const CalendarOnboarding: React.FC = () => {
  // Navigation hook for routing
  const navigate = useNavigate();
  
  // Calendar context for managing imported events
  const { events: importedEvents, addEvents } = useCalendar();
  
  // Goals context for managing user goals
  const { goals, addGoal: addGoalToContext } = useGoals();

  // Component state
  const [newGoal, setNewGoal] = useState<string>(''); // Current goal being typed
  const [hoveredButton, setHoveredButton] = useState<string | null>(null); // Button hover state for animations
  const [selectedDate] = useState<Date>(new Date()); // Current date for calendar display
  const [isImporting, setIsImporting] = useState<string | null>(null); // Track which import is in progress
  const [canvasUrl, setCanvasUrl] = useState<string>(''); // Canvas calendar URL input
  const [icsUrl, setIcsUrl] = useState<string>(''); // Generic ICS URL input

  /**
   * Add a new goal to the user's goal list
   * Trims whitespace and adds to context if valid
   */
  const addGoal = async () => {
    const trimmedGoal = newGoal.trim();
    if (trimmedGoal) {
      try {
        await addGoalToContext(trimmedGoal);
        setNewGoal('');
      } catch {
        // Handle error silently - could be improved with user feedback
      }
    }
  };

  /**
   * Load Google APIs script dynamically
   * Prevents duplicate script loading
   */
  React.useEffect(() => {
    const loadGoogleAPI = () => {
      // Check if Google API script is already loaded
      if (document.querySelector('script[src*="apis.google.com"]')) {
        return;
      }
      
      // Create and load Google API script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {};
      script.onerror = () => console.error('Failed to load Google API');
      document.head.appendChild(script);
    };
    loadGoogleAPI();
  }, []);

  /**
   * Parse ICS (iCalendar) file content into CalendarEvent objects
   * Handles various ICS formats and extracts event data
   * 
   * @param content - Raw ICS file content string
   * @returns Array of CalendarEvent objects
   */
  const parseICSFile = (content: string) => {
    const events: CalendarEvent[] = [];
    const lines = content.split(/\r?\n/).map(line => line.trim());
    let currentEvent: { [key: string]: string } = {};
    let inEvent = false;

    // Parse ICS line by line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === 'BEGIN:VEVENT') {
        // Start of new event
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT' && inEvent) {
        // End of event - create CalendarEvent if valid
        if (currentEvent.summary || currentEvent.dtstart) {
          events.push({
            id: Math.random().toString(36).substr(2, 9),
            title: currentEvent.summary || 'Untitled Event',
            date: currentEvent.dtstart ? parseICSDate(currentEvent.dtstart) : new Date(),
            time: currentEvent.dtstart ? parseICSTime(currentEvent.dtstart) : 'All Day',
            description: currentEvent.description || '',
            location: currentEvent.location || '',
            type: 'imported' as const
          });
        }
        inEvent = false;
      } else if (inEvent && line.includes(':')) {
        // Parse event properties
        const colonIndex = line.indexOf(':');
        const key = line.substring(0, colonIndex).toUpperCase();
        const value = line.substring(colonIndex + 1);
        
        // Extract relevant event data
        if (key.startsWith('SUMMARY')) {
          currentEvent.summary = value;
        } else if (key.startsWith('DTSTART')) {
          currentEvent.dtstart = value;
        } else if (key.startsWith('DESCRIPTION')) {
          currentEvent.description = value;
        } else if (key.startsWith('LOCATION')) {
          currentEvent.location = value;
        }
      }
    }
    return events;
  };

  /**
   * Parse ICS date format (YYYYMMDD or YYYYMMDDTHHMMSSZ) into JavaScript Date
   * 
   * @param dateStr - ICS formatted date string
   * @returns JavaScript Date object
   */
  const parseICSDate = (dateStr: string): Date => {
    if (dateStr.includes('T')) {
      // DateTime format
      const cleanDate = dateStr.replace(/[TZ]/g, '');
      const year = parseInt(cleanDate.substring(0, 4));
      const month = parseInt(cleanDate.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(cleanDate.substring(6, 8));
      return new Date(year, month, day);
    } else {
      // Date only format
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      return new Date(year, month, day);
    }
  };

  /**
   * Extract time from ICS datetime format
   * 
   * @param dateStr - ICS formatted datetime string
   * @returns Time string in HH:MM format or "All Day"
   */
  const parseICSTime = (dateStr: string): string => {
    if (dateStr.includes('T')) {
      const timePart = dateStr.split('T')[1].replace('Z', '');
      const hours = parseInt(timePart.substring(0, 2));
      const minutes = parseInt(timePart.substring(2, 4));
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return 'All Day';
  };

  /**
   * Import Canvas calendar from ICS URL
   * Uses proxy service to bypass CORS restrictions
   */
  const handleCanvasImport = async () => {
    if (!canvasUrl.trim()) {
      alert('Please enter a Canvas calendar URL');
      return;
    }

    setIsImporting('canvas');
    try {
      // Use CORS proxy service
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(canvasUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error(`Failed to fetch calendar: ${response.status}`);
      
      const data = await response.json();
      let content = data.contents;

      // Handle base64 encoded content
      if (content.startsWith('data:text/calendar') && content.includes('base64,')) {
        const base64Data = content.split('base64,')[1];
        content = atob(base64Data);
      }

      if (!content || content.trim() === '') throw new Error('Calendar file appears to be empty');

      // Parse and add events with Canvas type
      const events = parseICSFile(content);
      const eventsWithType = events.map(event => ({ ...event, type: 'canvas' as const }));
      addEvents(eventsWithType);
      
      alert(`Successfully imported ${events.length} events from Canvas!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error importing Canvas calendar: ${errorMessage}\n\nPlease make sure the URL is a direct link to an .ics file.`);
    } finally {
      setIsImporting(null);
    }
  };

  /**
   * Import calendar from generic ICS URL
   * Similar to Canvas import but with different event type
   */
  const handleICSImport = async () => {
    if (!icsUrl.trim()) {
      alert('Please enter a calendar URL');
      return;
    }

    setIsImporting('ics');
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(icsUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error(`Failed to fetch calendar: ${response.status}`);
      
      const data = await response.json();
      let content = data.contents;

      // Handle base64 encoded content
      if (content.startsWith('data:text/calendar') && content.includes('base64,')) {
        const base64Data = content.split('base64,')[1];
        content = atob(base64Data);
      }

      if (!content || content.trim() === '') throw new Error('Calendar file appears to be empty');

      // Parse and add events with imported type
      const events = parseICSFile(content);
      const eventsWithType = events.map(event => ({ ...event, type: 'imported' as const }));
      addEvents(eventsWithType);
      
      alert(`Successfully imported ${events.length} events from calendar!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error importing calendar: ${errorMessage}\n\nPlease make sure the URL is a direct link to an .ics file.`);
    } finally {
      setIsImporting(null);
    }
  };

  // Google Calendar API configuration
  const GOOGLE_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '761584657777-un14sj0ss535d098qiaui58vlpbif4vi.apps.googleusercontent.com',
    API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyC5PuMibhrYEJkxFS2N-BpfwqEH14KvDpw',
    DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    SCOPES: 'https://www.googleapis.com/auth/calendar.readonly'
  };

  /**
   * Check if Google API credentials are properly configured
   * Used to show setup warnings in the UI
   */
  const isGoogleConfigured = () => {
    return GOOGLE_CONFIG.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' &&
      GOOGLE_CONFIG.API_KEY !== 'YOUR_GOOGLE_API_KEY';
  };

  /**
   * Import Google Calendar events using OAuth 2.0
   * Handles authentication flow and API requests
   */
  const handleGoogleCalendarImport = async () => {
    setIsImporting('google');
    try {
      // Load Google Identity Services library
      await new Promise((resolve, reject) => {
        if (window.google?.accounts) {
          resolve(null);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Get OAuth access token
      const accessToken = await new Promise<string>((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CONFIG.CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          prompt: 'select_account',
          callback: (response: { error?: string; access_token?: string }) => {
            if (response.error) {
              reject(new Error(response.error));
            } else if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('No access token received'));
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      });

      // Fetch calendar events from Google Calendar API
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?` + new URLSearchParams({
        key: GOOGLE_CONFIG.API_KEY,
        timeMin: new Date().toISOString(), // Only future events
        maxResults: '50',
        singleEvents: 'true',
        orderBy: 'startTime'
      }), {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) throw new Error(`Calendar API request failed: ${response.status} ${response.statusText}`);

      const data = await response.json();

      // Google Calendar event interface
      interface GoogleCalendarEvent {
        id: string;
        summary?: string;
        start: {
          dateTime?: string;
          date?: string;
        };
        description?: string;
        location?: string;
      }

      // Transform Google events to our CalendarEvent format
      const events = data.items?.map((event: GoogleCalendarEvent) => ({
        id: event.id,
        title: event.summary || 'No Title',
        date: new Date(event.start.dateTime || event.start.date || ''),
        time: event.start.dateTime ?
          new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
          'All Day',
        description: event.description || '',
        location: event.location || '',
        type: 'google' as const
      })) || [];

      addEvents(events);
    } catch (error: unknown) {
      // Handle various error types with user-friendly messages
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === 'string') errorMessage = error;
      else if (error && typeof error === 'object') errorMessage = JSON.stringify(error);

      // Provide specific error messages for common issues
      if (errorMessage.includes('popup_blocked')) {
        alert('Please allow popups for this site to sign in with Google.');
      } else if (errorMessage.includes('access_denied')) {
        alert('Google Calendar access was denied. Please try again and grant permission.');
      } else if (errorMessage.includes('401')) {
        alert('Authentication failed. Please try signing in again.');
      } else if (errorMessage.includes('403')) {
        alert('Access forbidden. Make sure the Google Calendar API is enabled and you have the correct permissions.');
      } else {
        alert('Error connecting to Google Calendar: ' + errorMessage);
      }
    } finally {
      setIsImporting(null);
    }
  };

  /**
   * Calculate calendar grid layout information
   * Returns days in month and starting day of week
   */
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    return { daysInMonth, startingDayOfWeek };
  };

  /**
   * Get all events for a specific day
   * Used to display events in the calendar grid
   */
  const getEventsForDate = (day: number) => {
    const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return importedEvents.filter(event =>
      event.date.toDateString() === targetDate.toDateString()
    );
  };

  /**
   * Render the calendar grid with events
   * Creates a monthly view with event indicators
   */
  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
    const days = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Calendar header with month/year
    days.push(
      <div key="header" className="calendar-onboarding-calendar-header">
        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
      </div>
    );

    // Day labels (S M T W T F S)
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayLabels.forEach((label, i) => {
      days.push(
        <div key={`label-${i}`} className="calendar-onboarding-calendar-day-label">
          {label}
        </div>
      );
    });

    // Empty cells before first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-onboarding-calendar-empty" />
      );
    }

    // Calendar days with events
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      days.push(
        <div
          key={day}
          className={
            "calendar-onboarding-calendar-day" +
            (dayEvents.length > 0 ? " calendar-onboarding-calendar-day--has-events" : "")
          }
        >
          <div className="calendar-onboarding-calendar-day-number">{day}</div>
          {/* Show up to 2 events per day */}
          {dayEvents.slice(0, 2).map((event) => (
            <div
              key={event.id}
              title={`${event.title} - ${event.time}`}
              className={
                "calendar-onboarding-calendar-event " +
                (event.type === 'canvas'
                  ? "calendar-onboarding-calendar-event--canvas"
                  : event.type === 'google'
                  ? "calendar-onboarding-calendar-event--google"
                  : event.type === 'imported'
                  ? "calendar-onboarding-calendar-event--imported"
                  : "calendar-onboarding-calendar-event--other")
              }
            >
              {event.title}
            </div>
          ))}
          {/* Show "+X more" if there are additional events */}
          {dayEvents.length > 2 && (
            <div className="calendar-onboarding-calendar-more-events">
              +{dayEvents.length - 2}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  // Main component render
  return (
    <>
      <Navbar />
      <div className="calendar-onboarding-root">
        <div className="calendar-onboarding-grid">
          {/* Left side - Import controls and goals */}
          <div className="calendar-onboarding-left">
            <h1 className="calendar-onboarding-title">
              Let's set up your schedule!
            </h1>

            {/* Canvas Calendar Import Section */}
            <div className="calendar-onboarding-section">
              <h3 className="calendar-onboarding-section-title">
                Import Academic Schedule
              </h3>
              <input
                type="url"
                value={canvasUrl}
                onChange={(e) => setCanvasUrl(e.target.value)}
                placeholder="Enter Canvas calendar URL (.ics link)..."
                className="calendar-onboarding-input"
              />
              <button
                onClick={handleCanvasImport}
                disabled={isImporting === 'canvas'}
                className={
                  "calendar-onboarding-btn" +
                  (hoveredButton === 'canvas' && !isImporting ? " calendar-onboarding-btn--hover-canvas" : "")
                }
                onMouseEnter={() => !isImporting && setHoveredButton('canvas')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isImporting === 'canvas' ? (
                    <>
                      <div className="calendar-onboarding-btn-spinner" />
                      Importing...
                    </>
                  ) : (
                    <><GraduationCap size={25} /> Import Canvas Calendar</>
                  )}
                </span>
                {hoveredButton === 'canvas' && !isImporting && (
                  <div className="calendar-onboarding-btn-shimmer" />
                )}
              </button>
            </div>

            {/* Personal Calendar Import Section */}
            <div className="calendar-onboarding-section">
              <h3 className="calendar-onboarding-section-title">
                Import Personal Schedule
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Google Calendar Import Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    onClick={handleGoogleCalendarImport}
                    disabled={isImporting === 'google'}
                    className={
                      "calendar-onboarding-btn" +
                      (hoveredButton === 'google' && !isImporting ? " calendar-onboarding-btn--hover-google" : "") +
                      (!isGoogleConfigured() ? " calendar-onboarding-btn--google-setup" : "")
                    }
                    onMouseEnter={() => !isImporting && setHoveredButton('google')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isImporting === 'google' ? (
                        <>
                          <div className="calendar-onboarding-btn-spinner" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CalendarPlus size={25} /> Google Calendar {isGoogleConfigured() ? '' : '⚙️'}
                          </div>
                          {!isGoogleConfigured() && (
                            <div style={{ fontSize: '0.8em', opacity: 0.9 }}>
                              (Setup Required)
                            </div>
                          )}
                        </>
                      )}
                    </span>
                    {hoveredButton === 'google' && !isImporting && (
                      <div className="calendar-onboarding-btn-shimmer" />
                    )}
                  </button>
                </div>

                {/* Generic ICS Import */}
                <input
                  type="url"
                  value={icsUrl}
                  onChange={(e) => setIcsUrl(e.target.value)}
                  placeholder="Enter calendar URL (.ics link)..."
                  className="calendar-onboarding-input"
                />
                <button
                  onClick={handleICSImport}
                  disabled={isImporting === 'ics'}
                  className={
                    "calendar-onboarding-btn" +
                    (hoveredButton === 'ics' && !isImporting ? " calendar-onboarding-btn--hover-ics" : "")
                  }
                  onMouseEnter={() => !isImporting && setHoveredButton('ics')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isImporting === 'ics' ? (
                      <>
                        <div className="calendar-onboarding-btn-spinner" />
                        Importing...
                      </>
                    ) : (
                      <> <MailPlus size={25} /> Import calendar from link </>
                    )}
                  </span>
                  {hoveredButton === 'ics' && !isImporting && (
                    <div className="calendar-onboarding-btn-shimmer" />
                  )}
                </button>
              </div>
            </div>

            {/* Goals Management Section */}
            <div>
              <h3 className="calendar-onboarding-section-title">
                Goals
              </h3>
              {/* Display existing goals */}
              <div className="calendar-onboarding-goal-list">
                {goals.map((goal, index) => (
                  <div key={index} className="calendar-onboarding-goal-item">
                    {goal}
                  </div>
                ))}
              </div>
              {/* Add new goal input */}
              <div className="calendar-onboarding-goal-input-group">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add new goal..."
                  className="calendar-onboarding-goal-input"
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                />
                <button
                  onClick={addGoal}
                  className={
                    "calendar-onboarding-btn calendar-onboarding-btn--add" +
                    (hoveredButton === 'add' ? " calendar-onboarding-btn--hover-add calendar-onboarding-btn--add-hover" : "")
                  }
                  onMouseEnter={() => setHoveredButton('add')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <span className="calendar-onboarding-btn-icon" style={{ position: 'relative', zIndex: 2 }}>
                    +
                  </span>
                  {hoveredButton === 'add' && (
                    <div className="calendar-onboarding-btn-shimmer calendar-onboarding-btn-shimmer-add" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Calendar Preview */}
          <div className="calendar-onboarding-right">
            <h3 className="calendar-onboarding-calendar-title">
              Calendar Preview
            </h3>

            {/* Event count and legend */}
            {importedEvents.length > 0 && (
              <div className="calendar-onboarding-calendar-info">
                <div className="calendar-onboarding-calendar-info-title">
                  Imported Events: {importedEvents.length}
                </div>
                <div className="calendar-onboarding-calendar-info-legend">
                  <span className="calendar-onboarding-calendar-info-legend-canvas">● Canvas</span>
                  <span className="calendar-onboarding-calendar-info-legend-google">● Google</span>
                  <span className="calendar-onboarding-calendar-info-legend-outlook">● Outlook</span>
                </div>
              </div>
            )}

            {/* Calendar grid */}
            <div className="calendar-onboarding-calendar-preview">
              <div className="calendar-onboarding-calendar-grid">
                {renderCalendar()}
              </div>
            </div>

            {/* Empty state message with instructions */}
            {importedEvents.length === 0 && (
              <div className="calendar-onboarding-calendar-empty-message">
                📅 Import your calendars to see events appear here!
                <br />
                <br />
                <strong>Supported formats:</strong>
                <br />
                <br />
                • .ics links
                <br />
                <br />
                <strong>How to get calendar URLs:</strong>
                <br />
                <br />
                <strong>Canvas:</strong> Dashboard → Calendar → "Calendar Feed" button → Copy URL
                <br />
                <br />
                <strong>Outlook:</strong> outlook.live.com → Calendar → Share → "Publish calendar" → Copy ICS link
                <br />
    
                <br />
                <strong>Google:</strong> Use the Google Calendar button above for easy connection
              </div>
            )}

            {/* Continue button */}
            <div className="calendar-onboarding-done-btn-group">
              <button
                onClick={() => navigate('/calendar-ai')}
                className={
                  "calendar-onboarding-btn calendar-onboarding-btn--done" +
                  (hoveredButton === 'done' ? " calendar-onboarding-btn--hover-done" : "")
                }
                onMouseEnter={() => setHoveredButton('done')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={23} strokeWidth={3} /> Continue to AI Calendar
                </span>
                {hoveredButton === 'done' && (
                  <div className="calendar-onboarding-btn-shimmer" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarOnboarding;