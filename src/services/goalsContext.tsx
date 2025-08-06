import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchGoals, addGoalToServer, removeGoalFromServer, updateGoalsOnServer } from './goalsApi';
import { useAuth } from './authContext';

// Context interface - defines the shape of the goals context
interface GoalsContextType {
  goals: string[];                              // Array of user goals
  addGoal: (goal: string) => Promise<void>;     // Function to add a new goal
  removeGoal: (index: number) => Promise<void>; // Function to remove a goal by index
  clearGoals: () => Promise<void>;              // Function to clear all goals
  isLoading: boolean;                           // Loading state for API operations
  error: string | null;                         // Error message if operations fail
  refreshGoals: () => Promise<void>;            // Function to refresh goals from server
}

// Create the goals context with undefined default value
const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

// Props interface for the GoalsProvider component
interface GoalsProviderProps {
  children: ReactNode;
}

// Goals Provider component - manages goals state and provides context to children
export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  // State management for goals, loading, and error states
  const [goals, setGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get authentication context to check if user is logged in
  const { user, loading: authLoading } = useAuth();

  // Function to refresh goals from the backend server
  const refreshGoals = React.useCallback(async () => {
    // Early return if user is not authenticated
    if (!user) {
      setGoals([]); // Clear goals for unauthenticated users
      setError('Not logged in');
      return;
    }

    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);
    try {
      // Fetch goals from the server
      const serverGoals = await fetchGoals();
      setGoals(serverGoals);
    } catch (err: unknown) {
      console.error('Failed to load goals:', err);
      
      // Handle different types of errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Check if it's an authentication-related error
      if (errorMessage.includes('401') || errorMessage.includes('No token') || errorMessage.includes('Invalid token')) {
        console.log('User not authenticated, using empty goals');
        setGoals([]);
        setError('Not logged in');
      } else {
        // For non-auth errors, show error but keep existing goals
        setError(errorMessage || 'Failed to load goals');
      }
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  }, [user]);

  // Effect to load goals when authentication is complete and user is available
  useEffect(() => {
    // Only refresh goals after authentication loading is complete
    if (!authLoading) {
      refreshGoals();
    }
  }, [user, authLoading, refreshGoals]);

  // Function to add a single goal to the list
  const addGoal = async (goal: string) => {
    // Trim whitespace and validate input
    const trimmedGoal = goal.trim();
    if (!trimmedGoal || goals.includes(trimmedGoal)) {
      return; // Don't add empty or duplicate goals
    }

    // Check if user is authenticated
    if (!user) {
      setError('Please log in to save goals');
      return;
    }

    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);
    try {
      // Add goal to server and get updated goals list
      const updatedGoals = await addGoalToServer(trimmedGoal);
      setGoals(updatedGoals);
    } catch (err: unknown) {
      console.error('Failed to add goal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add goal';
      setError(errorMessage);
      throw err; // Re-throw so calling component can handle the error
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove a goal by its index
  const removeGoal = async (index: number) => {
    // Validate index bounds
    if (index < 0 || index >= goals.length) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      setError('Please log in to delete goals');
      return;
    }

    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);
    try {
      // Remove goal from server and get updated goals list
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

  // Function to clear all goals
  const clearGoals = async () => {
    // Check if user is authenticated
    if (!user) {
      setError('Please log in to clear goals');
      return;
    }

    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);
    try {
      // Update server with empty goals array
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

  // Provide context value to children components
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

// Custom hook for accessing goals context
export const useGoals = () => {
  const context = useContext(GoalsContext);
  // Throw error if hook is used outside of GoalsProvider
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
