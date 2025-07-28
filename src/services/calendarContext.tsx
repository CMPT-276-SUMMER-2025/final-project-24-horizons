import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Shared interface for calendar events
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  location: string;
  type: 'google' | 'canvas' | 'imported'; // Source of the event
}

// Context interface
interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  addEvents: (events: CalendarEvent[]) => void; // For bulk imports
  removeEvent: (id: string) => void;
  clearEvents: () => void;
  isLoading: boolean;
  error: string | null;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

// Component that wraps the app and provides calendar state
export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('imported_calendar_events');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        // Convert date strings back to Date objects
        const eventsWithDates = parsedEvents.map((event: CalendarEvent) => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(eventsWithDates);
        console.log(`📅 Loaded ${eventsWithDates.length} saved calendar events`);
      }
    } catch (error) {
      console.error('Error loading saved calendar events:', error);
      setError('Failed to load saved calendar events');
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    // Don't save on initial load (when events is empty from initial state)
    if (events.length === 0) return;
    
    try {
      localStorage.setItem('imported_calendar_events', JSON.stringify(events));
      console.log(`💾 Saved ${events.length} calendar events to localStorage`);
    } catch (error) {
      console.error('Error saving calendar events:', error);
      setError('Failed to save calendar events');
    }
  }, [events]);

  // Add a single event to the calendar
  const addEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  };

  // Add multiple events at once
  const addEvents = (newEvents: CalendarEvent[]) => {
    setEvents(prev => [...prev, ...newEvents]);
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <CalendarContext.Provider value={{
      events,
      addEvent,
      addEvents,
      removeEvent,
      clearEvents,
      isLoading,
      error
    }}>
      {children}
    </CalendarContext.Provider>
  );
};

// Hook for accessing calendar context
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};