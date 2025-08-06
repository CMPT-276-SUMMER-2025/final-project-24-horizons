import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

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

// Context interface defining the shape of our calendar context
interface CalendarContextType {
  events: CalendarEvent[]; // Array of all calendar events
  addEvent: (event: CalendarEvent) => void; // Function to add a single event
  addEvents: (events: CalendarEvent[]) => void; // For bulk imports from external sources
  removeEvent: (id: string) => void; // Function to remove an event by ID
  clearEvents: () => void; // Function to clear all events
  isLoading: boolean; // Loading state for async operations
  error: string | null; // Error state for handling failures
}

// Create the context with undefined as default value
const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Props interface for the CalendarProvider component
interface CalendarProviderProps {
  children: ReactNode; // React children components that will have access to the calendar context
}

// Component that wraps the app and provides calendar state
export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  // State to store all calendar events
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  // Loading state (currently not used but available for future async operations)
  const [isLoading] = useState(false);
  // Error state to track any failures in calendar operations
  const [error, setError] = useState<string | null>(null);

  // Effect to load events from localStorage on component mount
  useEffect(() => {
    try {
      // Attempt to retrieve saved events from browser's localStorage
      const savedEvents = localStorage.getItem('imported_calendar_events');
      if (savedEvents) {
        // Parse the JSON string back to JavaScript objects
        const parsedEvents = JSON.parse(savedEvents);
        // Convert date strings back to Date objects since JSON.parse doesn't handle dates
        const eventsWithDates = parsedEvents.map((event: CalendarEvent) => ({
          ...event,
          date: new Date(event.date) // Reconstruct Date object from string
        }));
        // Update the events state with loaded data
        setEvents(eventsWithDates);

      }
    } catch {
      // Handle any errors during loading (e.g., malformed JSON)
      setError('Failed to load saved calendar events');
    }
  }, []); // Empty dependency array means this runs once on mount

  // Effect to save events to localStorage whenever events change
  useEffect(() => {
    // Don't save on initial load when events array is empty from initial state
    // This prevents overwriting saved data with empty array
    if (events.length === 0) return;
    
    try {
      // Serialize events array to JSON string and save to localStorage
      localStorage.setItem('imported_calendar_events', JSON.stringify(events));
    } catch {
      // Handle any errors during saving (e.g., localStorage quota exceeded)
      setError('Failed to save calendar events');
    }
  }, [events]); // Re-run whenever events array changes

  // Function to add a single event to the calendar
  const addEvent = (event: CalendarEvent) => {
    // Use functional update to add new event to existing events array
    setEvents(prev => [...prev, event]);
  };

  // Adds multiple events to both Firebase and local state (useful for bulk imports from external sources)
  const addEvents = async (newEvents: CalendarEvent[]) => {
    const userId = 'demo-user'; 
    
    try {
      // Save each event to Firebase
      for (const event of newEvents) {
        await addDoc(collection(db, 'events'), {
          title: event.title,
          date: Timestamp.fromDate(event.date),
          time: event.time,
          description: event.description,
          location: event.location,
          type: event.type,
          category: event.type, 
          userId,
          createdAt: Timestamp.now()
        });
      }
      
      // Also update local state
      setEvents(prev => [...prev, ...newEvents]);
    } catch (error) {
      console.error('Error saving events to Firebase:', error);
      setError('Failed to save events');
      throw error;
    }
  };

  // Function to remove a specific event by its ID
  const removeEvent = (id: string) => {
    // Filter out the event with matching ID
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  // Function to clear all events from the calendar
  const clearEvents = () => {
  setEvents([]);
  localStorage.removeItem('imported_calendar_events');
  };

  // Provide the context value to all child components
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

// Custom hook for accessing calendar context in components
export const useCalendar = () => {
  // Get the context value
  const context = useContext(CalendarContext);
  
  // Throw error if hook is used outside of CalendarProvider
  // This ensures proper usage and helps catch development errors
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  
  return context;
};