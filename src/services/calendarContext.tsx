import React, { createContext, useContext, useState } from 'react';
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
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

// Component that wraps the app and provides calendar state
export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  // Central state for all calendar events
  const [events, setEvents] = useState<CalendarEvent[]>([]);

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
      clearEvents
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