import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchGoals, addGoalToServer, removeGoalFromServer, updateGoalsOnServer } from './goalsApi';
import { useAuth } from './authContext';

// Context interface defining what functions and data are available to components
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

// Component that wraps the app and provides goals state
export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth context to check if user is logged in
  const { user, loading: authLoading } = useAuth();

  // Load goals from the backend
  const refreshGoals = async () => {
    if (!user) {
      setGoals(['Gym', 'Job/ Project']); // Set default goals for unauthenticated users
      setError('Not logged in - using default goals');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const serverGoals = await fetchGoals();
      setGoals(serverGoals);
    } catch (err: any) {
      console.error('Failed to load goals:', err);
      
      // Check if it's an authentication error
      if (err.message.includes('401') || err.message.includes('No token') || err.message.includes('Invalid token')) {
        console.log('User not authenticated, using default goals');
        setError('Not logged in - using default goals');
        setGoals(['Gym', 'Job/ Project']);
      } else {
        setError('Failed to load goals from server');
        // Fall back to default goals if server fails
        setGoals(['Gym', 'Job/ Project']);
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
  }, [user, authLoading]);

  // Add a single goal to the list (and sync with backend)
  const addGoal = async (goal: string) => {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal || goals.includes(trimmedGoal)) {
      return;
    }

    // If user is not authenticated, only update locally
    if (!user) {
      setGoals(prev => [...prev, trimmedGoal]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedGoals = await addGoalToServer(trimmedGoal);
      setGoals(updatedGoals);
    } catch (err) {
      console.error('Failed to add goal:', err);
      setError('Failed to add goal to server');
      // Update UI even if server fails
      setGoals(prev => [...prev, trimmedGoal]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeGoal = async (index: number) => {
    if (index < 0 || index >= goals.length) {
      return;
    }

    if (!user) {
      setGoals(prev => prev.filter((_, i) => i !== index));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedGoals = await removeGoalFromServer(index);
      setGoals(updatedGoals);
    } catch (err) {
      console.error('Failed to remove goal:', err);
      setError('Failed to remove goal from server');
      setGoals(prev => prev.filter((_, i) => i !== index));
    } finally {
      setIsLoading(false);
    }
  };

  const clearGoals = async () => {
    if (!user) {
      setGoals([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedGoals = await updateGoalsOnServer([]);
      setGoals(updatedGoals);
    } catch (err) {
      console.error('Failed to clear goals:', err);
      setError('Failed to clear goals on server');
      setGoals([]);
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
