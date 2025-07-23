import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Context interface defining what functions and data are available to components
interface GoalsContextType {
  goals: string[];
  addGoal: (goal: string) => void;
  removeGoal: (index: number) => void;
  clearGoals: () => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

interface GoalsProviderProps {
  children: ReactNode;
}

// Component that wraps the app and provides goals state
export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  // Central state for all goals across the application
  const [goals, setGoals] = useState<string[]>(['Gym', 'Job/ Project']);

  // Add a single goal to the list
  const addGoal = (goal: string) => {
    const trimmedGoal = goal.trim();
    if (trimmedGoal && !goals.includes(trimmedGoal)) {
      setGoals(prev => [...prev, trimmedGoal]);
    }
  };

  const removeGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const clearGoals = () => {
    setGoals([]);
  };

  return (
    <GoalsContext.Provider value={{
      goals,
      addGoal,
      removeGoal,
      clearGoals
    }}>
      {children}
    </GoalsContext.Provider>
  );
};

// Hook for accessing goals context
export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
