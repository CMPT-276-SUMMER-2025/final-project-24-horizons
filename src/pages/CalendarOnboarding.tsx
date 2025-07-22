import React, { useState } from 'react';
import './CalendarOnboarding.css';
import Navbar from '../components/NavBar';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const CalendarOnboarding: React.FC = () => {
  const [goals, setGoals] = useState<string[]>(['Gym', 'Job/ Project']);
  const [newGoal, setNewGoal] = useState<string>('');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [importedEvents, setImportedEvents] = useState<any[]>([]);
  const [selectedDate] = useState<Date>(new Date());
  const [isImporting, setIsImporting] = useState<string | null>(null);
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);

  const [canvasUrl, setCanvasUrl] = useState<string>('');
  const [icsUrl, setIcsUrl] = useState<string>('');

  React.useEffect(() => {
    const loadGoogleAPI = () => {
      if (document.querySelector('script[src*="apis.google.com"]')) {
        setGoogleApiLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => setGoogleApiLoaded(true);
      script.onerror = () => console.error('Failed to load Google API');
      document.head.appendChild(script);
    };
    loadGoogleAPI();
  }, []);

  const addGoal = (): void => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const parseICSFile = (content: string) => {
    const events: any[] = [];
    const lines = content.split(/\r?\n/).map(line => line.trim());
    let currentEvent: any = {};
    let inEvent = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT' && inEvent) {
        if (currentEvent.summary || currentEvent.dtstart) {
          events.push({
            id: Math.random().toString(36).substr(2, 9),
            title: currentEvent.summary || 'Untitled Event',
            date: currentEvent.dtstart ? parseICSDate(currentEvent.dtstart) : new Date(),
            time: currentEvent.dtstart ? parseICSTime(currentEvent.dtstart) : 'All Day',
            description: currentEvent.description || '',
            location: currentEvent.location || '',
            type: 'imported'
          });
        }
        inEvent = false;
      } else if (inEvent && line.includes(':')) {
        const colonIndex = line.indexOf(':');
        const key = line.substring(0, colonIndex).toUpperCase();
        const value = line.substring(colonIndex + 1);
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

  const parseICSDate = (dateStr: string): Date => {
    if (dateStr.includes('T')) {
      const cleanDate = dateStr.replace(/[TZ]/g, '');
      const year = parseInt(cleanDate.substring(0, 4));
      const month = parseInt(cleanDate.substring(4, 6)) - 1;
      const day = parseInt(cleanDate.substring(6, 8));
      return new Date(year, month, day);
    } else {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      return new Date(year, month, day);
    }
  };

  const parseICSTime = (dateStr: string): string => {
    if (dateStr.includes('T')) {
      const timePart = dateStr.split('T')[1].replace('Z', '');
      const hours = parseInt(timePart.substring(0, 2));
      const minutes = parseInt(timePart.substring(2, 4));
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    return 'All Day';
  };

  const handleCanvasImport = async () => {
    if (!canvasUrl.trim()) {
      alert('Please enter a Canvas calendar URL');
      return;
    }
    setIsImporting('canvas');
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(canvasUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Failed to fetch calendar: ${response.status}`);
      const data = await response.json();
      let content = data.contents;
      if (content.startsWith('data:text/calendar') && content.includes('base64,')) {
        const base64Data = content.split('base64,')[1];
        content = atob(base64Data);
      }
      if (!content || content.trim() === '') throw new Error('Calendar file appears to be empty');
      const events = parseICSFile(content);
      const eventsWithType = events.map(event => ({ ...event, type: 'canvas' }));
      setImportedEvents(prev => [...prev, ...eventsWithType]);
      alert(`Successfully imported ${events.length} events from Canvas!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error importing Canvas calendar: ${errorMessage}\n\nPlease make sure the URL is a direct link to an .ics file.`);
    } finally {
      setIsImporting(null);
    }
  };

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
      if (content.startsWith('data:text/calendar') && content.includes('base64,')) {
        const base64Data = content.split('base64,')[1];
        content = atob(base64Data);
      }
      if (!content || content.trim() === '') throw new Error('Calendar file appears to be empty');
      const events = parseICSFile(content);
      const eventsWithType = events.map(event => ({ ...event, type: 'imported' }));
      setImportedEvents(prev => [...prev, ...eventsWithType]);
      alert(`Successfully imported ${events.length} events from calendar!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error importing calendar: ${errorMessage}\n\nPlease make sure the URL is a direct link to an .ics file.`);
    } finally {
      setIsImporting(null);
    }
  };

  const GOOGLE_CONFIG = {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '761584657777-un14sj0ss535d098qiaui58vlpbif4vi.apps.googleusercontent.com',
    API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyC5PuMibhrYEJkxFS2N-BpfwqEH14KvDpw',
    DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    SCOPES: 'https://www.googleapis.com/auth/calendar.readonly'
  };

  const isGoogleConfigured = () => {
    return GOOGLE_CONFIG.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' &&
      GOOGLE_CONFIG.API_KEY !== 'YOUR_GOOGLE_API_KEY';
  };

  const handleGoogleCalendarImport = async () => {
    setIsImporting('google');
    try {
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
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?` + new URLSearchParams({
        key: GOOGLE_CONFIG.API_KEY,
        timeMin: new Date().toISOString(),
        maxResults: '50',
        singleEvents: 'true',
        orderBy: 'startTime'
      }), {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error(`Calendar API request failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      const events = data.items?.map((event: any) => ({
        id: event.id,
        title: event.summary || 'No Title',
        date: new Date(event.start.dateTime || event.start.date),
        time: event.start.dateTime ?
          new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
          'All Day',
        description: event.description || '',
        location: event.location || '',
        type: 'google'
      })) || [];
      setImportedEvents(prev => [...prev, ...events]);
    } catch (error: unknown) {
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === 'string') errorMessage = error;
      else if (error && typeof error === 'object') errorMessage = JSON.stringify(error);
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (day: number) => {
    const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return importedEvents.filter(event =>
      event.date.toDateString() === targetDate.toDateString()
    );
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
    const days = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    days.push(
      <div key="header" className="calendar-onboarding-calendar-header">
        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
      </div>
    );

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayLabels.forEach((label, i) => {
      days.push(
        <div key={`label-${i}`} className="calendar-onboarding-calendar-day-label">
          {label}
        </div>
      );
    });

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-onboarding-calendar-empty" />
      );
    }

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
          {dayEvents.slice(0, 2).map((event, i) => (
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

  return (
    <>
      <Navbar />
      <div className="calendar-onboarding-root">
        <div className="calendar-onboarding-grid">
          {/* Left side */}
          <div className="calendar-onboarding-left">
            <h1 className="calendar-onboarding-title">
              Let's set up your schedule!
            </h1>

            <div className="calendar-onboarding-section">
              <h3 className="calendar-onboarding-section-title">
                Import Academic Schedule
              </h3>
              <input
                type="url"
                value={canvasUrl}
                onChange={(e) => setCanvasUrl(e.target.value)}
                placeholder="Enter Canvas calendar URL..."
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
                    <>📚 Import Canvas from URL</>
                  )}
                </span>
                {hoveredButton === 'canvas' && !isImporting && (
                  <div className="calendar-onboarding-btn-shimmer" />
                )}
              </button>
            </div>

            <div className="calendar-onboarding-section">
              <h3 className="calendar-onboarding-section-title">
                Import Personal Schedule
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                            🗓️ Google Calendar {isGoogleConfigured() ? '' : '⚙️'}
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

                <input
                  type="url"
                  value={icsUrl}
                  onChange={(e) => setIcsUrl(e.target.value)}
                  placeholder="Enter calendar URL (.ics file)..."
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
                      <> 📧 Import Outlook Calendar from URL </>
                    )}
                  </span>
                  {hoveredButton === 'ics' && !isImporting && (
                    <div className="calendar-onboarding-btn-shimmer" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <h3 className="calendar-onboarding-section-title">
                Goals
              </h3>
              <div className="calendar-onboarding-goal-list">
                {goals.map((goal, index) => (
                  <div key={index} className="calendar-onboarding-goal-item">
                    {goal}
                  </div>
                ))}
              </div>
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

          {/* Right side */}
          <div className="calendar-onboarding-right">
            <h3 className="calendar-onboarding-calendar-title">
              Calendar Preview
            </h3>

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

            <div className="calendar-onboarding-calendar-preview">
              <div className="calendar-onboarding-calendar-grid">
                {renderCalendar()}
              </div>
            </div>

            {importedEvents.length === 0 && (
              <div className="calendar-onboarding-calendar-empty-message">
                📅 Import your calendars to see events appear here!
                <br />
                <br />
                <strong>Supported formats:</strong>
                <br />
                • .ics files (iCalendar format)
                <br />
                • Canvas exported calendars
                <br />
                • Google Calendar exports
                <br />
                • Outlook calendar exports
              </div>
            )}

            <div className="calendar-onboarding-done-btn-group">
              <button
                className={
                  "calendar-onboarding-btn calendar-onboarding-btn--done" +
                  (hoveredButton === 'done' ? " calendar-onboarding-btn--hover-done" : "")
                }
                onMouseEnter={() => setHoveredButton('done')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ✨ Done
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