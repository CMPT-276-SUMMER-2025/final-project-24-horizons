import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type TimerContextType = {
  isRunning: boolean;
  timeLeft: number;
  sessionDuration: number;
  setSessionDuration: (minutes: number) => void;
  startTimer: (minutes?: number) => void;
  stopTimer: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(25); // <-- ✅ Add this line

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = (minutes?: number) => {
    const duration = minutes ?? sessionDuration;
    setTimeLeft(duration * 60);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setTimeLeft(0);
    setIsRunning(false);
  };

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

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
