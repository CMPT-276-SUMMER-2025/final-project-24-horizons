import React, { useState } from 'react';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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

    console.log('Total lines in ICS:', lines.length); 

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
        console.log('Found event start at line:', i); 
      } else if (line === 'END:VEVENT' && inEvent) {
        console.log('Event end, current event:', currentEvent); 
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

    console.log('Final parsed events:', events); 
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

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar: ${response.status}`);
      }

      const data = await response.json();
      let content = data.contents;

      
      if (content.startsWith('data:text/calendar') && content.includes('base64,')) {
        
        const base64Data = content.split('base64,')[1];
        content = atob(base64Data); 
        console.log('Decoded base64 content');
      }

      if (!content || content.trim() === '') {
        throw new Error('Calendar file appears to be empty');
      }

      const events = parseICSFile(content);
      const eventsWithType = events.map(event => ({ ...event, type: 'canvas' }));
      setImportedEvents(prev => [...prev, ...eventsWithType]);

      alert(`Successfully imported ${events.length} events from Canvas!`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching Canvas calendar:', error);
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

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar: ${response.status}`);
      }

      const data = await response.json();
      let content = data.contents;

      
      if (content.startsWith('data:text/calendar') && content.includes('base64,')) {
        
        const base64Data = content.split('base64,')[1];
        content = atob(base64Data); 
        console.log('Decoded base64 content');
      }

      
      console.log('Final content to parse:', content.substring(0, 500));
      console.log('Content length:', content.length);

      if (!content || content.trim() === '') {
        throw new Error('Calendar file appears to be empty');
      }

      const events = parseICSFile(content);
      console.log('Parsed events:', events);

      const eventsWithType = events.map(event => ({ ...event, type: 'imported' }));
      setImportedEvents(prev => [...prev, ...eventsWithType]);

      alert(`Successfully imported ${events.length} events from calendar!`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching ICS file:', error);
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

        tokenClient.requestAccessToken({
          prompt: 'select_account'
        });
      });

      
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?` + new URLSearchParams({
        key: GOOGLE_CONFIG.API_KEY,
        timeMin: new Date().toISOString(),
        maxResults: '50',
        singleEvents: 'true',
        orderBy: 'startTime'
      }), {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Calendar API request failed: ${response.status} ${response.statusText}`);
      }

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
      console.error('Google Calendar import error:', error);

      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }

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
      <div key="header" style={{
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '8px',
        backgroundColor: '#5bb69e',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
      </div>
    );

    
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayLabels.forEach((label, i) => {
      days.push(
        <div key={`label-${i}`} style={{
          padding: '4px',
          textAlign: 'center',
          backgroundColor: '#4a5668',
          color: '#e0e0e0',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {label}
        </div>
      );
    });

    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} style={{
          backgroundColor: '#2d2d2d'
        }} />
      );
    }

    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      days.push(
        <div key={day} style={{
          backgroundColor: '#2d2d2d',
          padding: '4px',
          minHeight: '40px',
          position: 'relative',
          border: dayEvents.length > 0 ? '1px solid #5bb69e' : 'none'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#a0a0a0',
            marginBottom: '2px'
          }}>
            {day}
          </div>
          {dayEvents.slice(0, 2).map((event, i) => (
            <div key={event.id}
              title={`${event.title} - ${event.time}`}
              style={{
                fontSize: '8px',
                padding: '1px 2px',
                marginBottom: '1px',
                borderRadius: '2px',
                backgroundColor: event.type === 'canvas' ? '#ff6b6b' :
                  event.type === 'google' ? '#4285f4' :
                    event.type === 'imported' ? '#9b59b6' : '#0078d4',
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}>
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div style={{
              fontSize: '8px',
              color: '#5bb69e',
              textAlign: 'center'
            }}>
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
      <style>
        {`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Hidden file inputs */}

      <div style={{
        padding: '4rem 5rem',
        backgroundColor: '#2c3e50',
        minHeight: '100vh',
        margin: 0,
        width: '100%',
        boxSizing: 'border-box'
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6rem',
          alignItems: 'start'
        }}>
          {/* Left side */}
          <div style={{
            backgroundColor: '#3b4a61',
            padding: '3rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(91, 182, 158, 0.3)',
            border: '1px solid #5bb69e'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '2.5rem',
              color: '#ffffff',
              fontWeight: '700'
            }}>
              Let's set up your schedule!
            </h1>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#e0e0e0', fontSize: '1.2rem', fontWeight: '600' }}>
                Import Academic Schedule
              </h3>
              <input
                type="url"
                value={canvasUrl}
                onChange={(e) => setCanvasUrl(e.target.value)}
                placeholder="Enter Canvas calendar URL..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#4a5668',
                  color: '#ffffff',
                  border: '2px solid #5bb69e',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={handleCanvasImport}
                disabled={isImporting === 'canvas'}
                style={{
                  borderRadius: '12px',
                  border: '2px solid transparent',
                  padding: '0.8em 1.5em',
                  fontSize: '1em',
                  width: '100%',
                  fontWeight: '600',
                  fontFamily: 'inherit',
                  background: hoveredButton === 'canvas'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #5bb69e 0%, #4a9a82 100%)',
                  color: 'white',
                  cursor: isImporting === 'canvas' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  borderColor: hoveredButton === 'canvas' ? '#646cff' : 'transparent',
                  transform: hoveredButton === 'canvas' && !isImporting ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredButton === 'canvas'
                    ? '0 8px 25px rgba(100, 108, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)'
                    : '0 4px 15px rgba(91, 182, 158, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isImporting === 'canvas' ? 0.7 : 1
                }}
                onMouseEnter={() => !isImporting && setHoveredButton('canvas')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {isImporting === 'canvas' ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Importing...
                    </>
                  ) : (
                    <>📚 Import Canvas from URL</>
                  )}
                </span>
                {hoveredButton === 'canvas' && !isImporting && (
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 0.6s ease-out',
                    zIndex: 1
                  }} />
                )}
              </button>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#e0e0e0', fontSize: '1.2rem', fontWeight: '600' }}>
                Import Personal Schedule
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button
                    onClick={handleGoogleCalendarImport}
                    disabled={isImporting === 'google'}
                    style={{
                      borderRadius: '12px',
                      border: '2px solid transparent',
                      padding: '0.8em 1.5em',
                      fontSize: '1em',
                      fontWeight: '600',
                      fontFamily: 'inherit',
                      background: hoveredButton === 'google'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : isGoogleConfigured()
                          ? 'linear-gradient(135deg, #5bb69e 0%, #4a9a82 100%)'
                          : 'linear-gradient(135deg, #f39c12 0%, #d68910 100%)',
                      color: 'white',
                      cursor: isImporting === 'google' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                      flex: 1,
                      borderColor: hoveredButton === 'google' ? '#646cff' : 'transparent',
                      transform: hoveredButton === 'google' && !isImporting ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                      boxShadow: hoveredButton === 'google'
                        ? '0 8px 25px rgba(100, 108, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)'
                        : isGoogleConfigured()
                          ? '0 4px 15px rgba(91, 182, 158, 0.2)'
                          : '0 4px 15px rgba(243, 156, 18, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: isImporting === 'google' ? 0.7 : 1
                    }}
                    onMouseEnter={() => !isImporting && setHoveredButton('google')}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    <span style={{
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                      
                    }}>
                      {isImporting === 'google' ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
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
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        animation: 'shimmer 0.6s ease-out',
                        zIndex: 1
                      }} />
                    )}
                  </button>

                </div>

                <input
                  type="url"
                  value={icsUrl}
                  onChange={(e) => setIcsUrl(e.target.value)}
                  placeholder="Enter calendar URL (.ics file)..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#4a5668',
                    color: '#ffffff',
                    border: '2px solid #5bb69e',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    marginBottom: '12px'
                  }}
                />
                <button
                  onClick={handleICSImport}
                  disabled={isImporting === 'ics'}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid transparent',
                    padding: '0.8em 1.5em',
                    fontSize: '1em',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    background: hoveredButton === 'ics'  
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #5bb69e 0%, #4a9a82 100%)',
                    color: 'white',
                    cursor: isImporting === 'ics' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    borderColor: hoveredButton === 'ics' ? '#646cff' : 'transparent',
                    transform: hoveredButton === 'ics' && !isImporting ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                    boxShadow: hoveredButton === 'ics'
                      ? '0 8px 25px rgba(100, 108, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)'
                      : '0 4px 15px rgba(91, 182, 158, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    opacity: isImporting === 'ics' ? 0.7 : 1
                  }}
                  onMouseEnter={() => !isImporting && setHoveredButton('ics')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <span style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {isImporting === 'ics' ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Importing...
                      </>
                    ) : (
                      <> 📧 Import Outlook Calendar from URL </>
                    )}
                  </span>
                  {hoveredButton === 'ics' && !isImporting && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 'shimmer 0.6s ease-out',
                      zIndex: 1
                    }} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#e0e0e0', fontSize: '1.2rem', fontWeight: '600' }}>
                Goals
              </h3>
              <div style={{ marginBottom: '1.5rem' }}>
                {goals.map((goal, index) => (
                  <div key={index} style={{
                    padding: '16px 20px',
                    backgroundColor: '#4a5668',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    border: '1px solid #5bb69e'
                  }}>
                    {goal}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add new goal..."
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    backgroundColor: '#4a5668',
                    color: '#ffffff',
                    border: '2px solid #5bb69e',
                    borderRadius: '10px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                />
                <button
                  onClick={addGoal}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid transparent',
                    padding: '0.8em 1.2em',
                    fontSize: '1.2em',
                    fontWeight: '700',
                    fontFamily: 'inherit',
                    background: hoveredButton === 'add'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #5bb69e 0%, #4a9a82 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                    borderColor: hoveredButton === 'add' ? '#646cff' : 'transparent',
                    transform: hoveredButton === 'add' ? 'translateY(-4px) scale(1.1) rotate(90deg)' : 'translateY(0) scale(1) rotate(0deg)',
                    boxShadow: hoveredButton === 'add'
                      ? '0 8px 25px rgba(100, 108, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)'
                      : '0 4px 15px rgba(91, 182, 158, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={() => setHoveredButton('add')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <span style={{
                    position: 'relative',
                    zIndex: 2,
                    fontSize: '1.5em'
                  }}>
                    +
                  </span>
                  {hoveredButton === 'add' && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 0.6s ease-out',
                      zIndex: 1
                    }} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{
            backgroundColor: '#3b4a61',
            padding: '3rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(91, 182, 158, 0.3)',
            border: '1px solid #5bb69e'
          }}>
            <h3 style={{
              marginBottom: '2rem',
              color: '#e0e0e0',
              fontSize: '1.2rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Calendar Preview
            </h3>

            {importedEvents.length > 0 && (
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#4a5668',
                borderRadius: '8px',
                border: '1px solid #5bb69e'
              }}>
                <div style={{ color: '#e0e0e0', fontSize: '14px', marginBottom: '8px' }}>
                  Imported Events: {importedEvents.length}
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#ff6b6b' }}>● Canvas</span>
                  <span style={{ color: '#4285f4' }}>● Google</span>
                  <span style={{ color: '#9b59b6' }}>● Outlook</span>
                </div>
              </div>
            )}

            <div style={{
              width: '100%',
              height: '450px',
              border: '4px solid #5bb69e',
              borderRadius: '20px',
              backgroundColor: '#1a1a1a',
              position: 'relative',
              marginBottom: '2rem'
            }}>
              <div style={{
                position: 'absolute',
                inset: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gridTemplateRows: 'auto auto repeat(6, 1fr)',
                gap: '1px',
                backgroundColor: '#5bb69e'
              }}>
                {renderCalendar()}
              </div>
            </div>

            {importedEvents.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#a0a0a0',
                fontSize: '14px',
                marginBottom: '2rem',
                padding: '1rem',
                backgroundColor: '#4a5668',
                borderRadius: '8px',
                border: '1px solid #5bb69e'
              }}>
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

            <div style={{ textAlign: 'center' }}>
              <button style={{
                borderRadius: '12px',
                border: '2px solid transparent',
                padding: '0.8em 2em',
                fontSize: '1.1em',
                fontWeight: '600',
                fontFamily: 'inherit',
                background: hoveredButton === 'done'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #5bb69e 0%, #4a9a82 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                borderColor: hoveredButton === 'done' ? '#646cff' : 'transparent',
                transform: hoveredButton === 'done' ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                boxShadow: hoveredButton === 'done'
                  ? '0 8px 25px rgba(100, 108, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1)'
                  : '0 4px 15px rgba(91, 182, 158, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
                onMouseEnter={() => setHoveredButton('done')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <span style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✨ Done
                </span>
                {hoveredButton === 'done' && (
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 0.6s ease-out',
                    zIndex: 1
                  }} />
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