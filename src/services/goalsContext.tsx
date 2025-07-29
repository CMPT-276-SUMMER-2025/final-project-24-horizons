import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchGoals, addGoalToServer, removeGoalFromServer, updateGoalsOnServer } from './goalsApi';
import { useAuth } from './authContext';

// Context interface
interface GoalsContextType {
  goals: string[];
  addGoal: (goal: string) => Promise<void>;
  removeGoal: (index: number) => Promise<void>;
  clearGoals: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshGoals: () => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

interface GoalsProviderProps {
  children: ReactNode;
}

// Wrapper component
export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth context to check if user is logged in
  const { user, loading: authLoading } = useAuth();

  // Load goals from the backend
  const refreshGoals = async () => {
    if (!user) {
      setGoals([]); // Empty goals for unauthenticated users
      setError('Not logged in');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const serverGoals = await fetchGoals();
      setGoals(serverGoals);
    } catch (err: unknown) {
      console.error('Failed to load goals:', err);
      
      // Check if it's an authentication error
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('401') || errorMessage.includes('No token') || errorMessage.includes('Invalid token')) {
        console.log('User not authenticated, using empty goals');
        setGoals([]);
        setError('Not logged in');
      } else {
        setError(errorMessage || 'Failed to load goals');
        // Keep existing goals on non-auth errors
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load goals when authentication is complete and user is available
  useEffect(() => {
    if (!authLoading) {
      refreshGoals();
    }
  }, [user, authLoading]); // lint disable

  // Add a single goal to the list
  const addGoal = async (goal: string) => {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal || goals.includes(trimmedGoal)) {
      return;
    }

    if (!user) {
      setError('Please log in to save goals');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedGoals = await addGoalToServer(trimmedGoal);
      setGoals(updatedGoals);
    } catch (err: unknown) {
      console.error('Failed to add goal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add goal';
      setError(errorMessage);
      throw err; // Re-throw so component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const removeGoal = async (index: number) => {
    if (index < 0 || index >= goals.length) {
      return;
    }

    if (!user) {
      setError('Please log in to delete goals');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedGoals = await removeGoalFromServer(index);
      setGoals(updatedGoals);
    } catch (err: unknown) {
      console.error('Failed to remove goal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove goal';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearGoals = async () => {
    if (!user) {
      setError('Please log in to clear goals');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedGoals = await updateGoalsOnServer([]);
      setGoals(updatedGoals);
    } catch (err: unknown) {
      console.error('Failed to clear goals:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear goals';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoalsContext.Provider value={{
      goals,
      addGoal,
      removeGoal,
      clearGoals,
      isLoading,
      error,
      refreshGoals
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
