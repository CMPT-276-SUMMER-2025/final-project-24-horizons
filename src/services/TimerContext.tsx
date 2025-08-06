import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define the shape of the timer context data
type TimerContextType = {
  isRunning: boolean;
  timeLeft: number; // Time remaining in seconds
  sessionDuration: number; // Duration of a session in minutes
  setSessionDuration: (minutes: number) => void;
  startTimer: (minutes?: number) => void;
  stopTimer: () => void;
};

// Create the timer context with undefined as initial value
const TimerContext = createContext<TimerContextType | undefined>(undefined);

/**
 * Timer Provider Component
 * Manages timer state and provides timer functionality to child components
 */
export function TimerProvider({ children }: { children: ReactNode }) {
  // Timer running state
  const [isRunning, setIsRunning] = useState(false);
  // Time left in seconds
  const [timeLeft, setTimeLeft] = useState(0);
  // Default session duration in minutes
  const [sessionDuration, setSessionDuration] = useState(25);

  // Effect to handle timer countdown when running
  useEffect(() => {
    // Don't run timer if not active
    if (!isRunning) return;

    // Set up interval to decrement time every second
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        // Stop timer when time reaches 0
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        // Decrement time by 1 second
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval on component unmount or when isRunning changes
    return () => clearInterval(interval);
  }, [isRunning]);

  /**
   * Start the timer with specified or default duration
   * @param minutes - Duration in minutes (optional, uses sessionDuration if not provided)
   */
  const startTimer = (minutes?: number) => {
    const duration = minutes ?? sessionDuration;
    // Convert minutes to seconds
    setTimeLeft(duration * 60);
    setIsRunning(true);
  };

  /**
   * Stop the timer and reset time to 0
   */
  const stopTimer = () => {
    setTimeLeft(0);
    setIsRunning(false);
  };

  // Provide context values to child components
  return (
    <TimerContext.Provider
      value={{
        isRunning,
        timeLeft,
        sessionDuration,
        setSessionDuration,
        startTimer,
        stopTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

/**
 * Custom hook to access timer context
 * @returns TimerContextType - The timer context data and functions
 * @throws Error if used outside of TimerProvider
 */
export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

