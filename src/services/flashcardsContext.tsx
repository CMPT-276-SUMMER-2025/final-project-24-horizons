import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchFlashcards, addFlashcardToServer, removeFlashcardFromServer, updateFlashcardOnServer } from './flashcardsApi';
import type { Flashcard } from './flashcardsApi';
import { useAuth } from './authContext';

// Context interface defining the shape of flashcards context
interface FlashcardsContextType {
  flashcards: Flashcard[];
  addFlashcard: (front: string, back: string) => Promise<void>;
  removeFlashcard: (id: number) => Promise<void>;
  updateFlashcard: (id: number, front: string, back: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshFlashcards: () => Promise<void>;
}

// Create the flashcards context with undefined as default value
const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

// Props interface for the FlashcardsProvider component
interface FlashcardsProviderProps {
  children: ReactNode;
}

/**
 * FlashcardsProvider component that wraps the application and provides flashcards context
 * Manages flashcards state, authentication checks, and API interactions
 */
export const FlashcardsProvider: React.FC<FlashcardsProviderProps> = ({ children }) => {
  // State for storing the array of flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  // State for tracking loading status during API operations
  const [isLoading, setIsLoading] = useState(false);
  // State for storing error messages
  const [error, setError] = useState<string | null>(null);

  // Get auth context to check if user is logged in and get loading state
  const { user, loading: authLoading } = useAuth();

  /**
   * Load flashcards from the backend server
   * Only executes if user is authenticated, otherwise clears flashcards
   */
  const refreshFlashcards = React.useCallback(async () => {
    // Check if user is authenticated before fetching
    if (!user) {
      setFlashcards([]);
      setError('Not logged in');
      return;
    }

    // Set loading state and clear any previous errors
    setIsLoading(true);
    setError(null);
    try {
      // Fetch flashcards from the server
      const serverFlashcards = await fetchFlashcards();
      setFlashcards(serverFlashcards);
    } catch (err: unknown) {
      console.error('Failed to load flashcards:', err);
      
      // Handle different types of errors, especially authentication errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('401') || errorMessage.includes('No token') || errorMessage.includes('Invalid token')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load flashcards. Please try again.');
      }
    } finally {
      // Always clear loading state regardless of success/failure
      setIsLoading(false);
    }
  }, [user]); // Re-run callback when user changes

  /**
   * Add a new flashcard to the collection
   * @param front - The front text of the flashcard
   * @param back - The back text of the flashcard
   */
  const addFlashcard = async (front: string, back: string) => {
    // Ensure user is authenticated before creating flashcard
    if (!user) {
      setError('Must be logged in to create flashcards');
      return;
    }

    // Set loading state and clear previous errors
    setIsLoading(true);
    setError(null);
    try {
      // Create flashcard on server
      const newFlashcard = await addFlashcardToServer(front, back);
      // Add new flashcard to the beginning of the local array
      setFlashcards(prevFlashcards => [newFlashcard, ...prevFlashcards]);
    } catch (err: unknown) {
      console.error('Failed to add flashcard:', err);
      
      // Handle authentication and other errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('401') || errorMessage.includes('No token') || errorMessage.includes('Invalid token')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to create flashcard. Please try again.');
      }
      // Re-throw error so calling component can handle it
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove a flashcard from the collection
   * @param id - The ID of the flashcard to remove
   */
  const removeFlashcard = async (id: number) => {
    // Ensure user is authenticated before deleting
    if (!user) {
      setError('Must be logged in to delete flashcards');
      return;
    }

    setError(null);
    try {
      // Delete flashcard from server
      await removeFlashcardFromServer(id);
      // Remove flashcard from local state by filtering out the deleted ID
      setFlashcards(prevFlashcards => prevFlashcards.filter(flashcard => flashcard.id !== id));
    } catch (err: unknown) {
      console.error('Failed to delete flashcard:', err);
      
      // Handle authentication and other errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('401') || errorMessage.includes('No token') || errorMessage.includes('Invalid token')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to delete flashcard. Please try again.');
      }
      // Re-throw error for calling component to handle
      throw err;
    }
  };

  /**
   * Update an existing flashcard
   * @param id - The ID of the flashcard to update
   * @param front - The new front text
   * @param back - The new back text
   */
  const updateFlashcard = async (id: number, front: string, back: string) => {
    // Ensure user is authenticated before updating
    if (!user) {
      setError('Must be logged in to update flashcards');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Update flashcard on server
      const updatedFlashcard = await updateFlashcardOnServer(id, front, back);
      // Update the flashcard in local state by mapping over array and replacing matching ID
      setFlashcards(prevFlashcards => 
        prevFlashcards.map(flashcard => 
          flashcard.id === id ? updatedFlashcard : flashcard
        )
      );
    } catch (err: unknown) {
      console.error('Failed to update flashcard:', err);
      
      // Handle authentication and other errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('401') || errorMessage.includes('No token') || errorMessage.includes('Invalid token')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to update flashcard. Please try again.');
      }
      // Re-throw error for calling component to handle
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect hook that runs when authentication state changes
   * Loads flashcards when user logs in, clears them when user logs out
   */
  useEffect(() => {
    if (!authLoading && user) {
      // User is logged in and auth is not loading, fetch flashcards
      refreshFlashcards();
    } else if (!authLoading && !user) {
      // User is not logged in and auth is not loading, clear flashcards and errors
      setFlashcards([]);
      setError(null);
    }
  }, [user, authLoading, refreshFlashcards]); // Dependencies: re-run when these values change

  // Create the context value object with all flashcards functions and state
  const value: FlashcardsContextType = {
    flashcards,
    addFlashcard,
    removeFlashcard,
    updateFlashcard,
    isLoading,
    error,
    refreshFlashcards,
  };

  // Provide the context value to all child components
  return (
    <FlashcardsContext.Provider value={value}>
      {children}
    </FlashcardsContext.Provider>
  );
};

/**
 * Custom hook for components to access the flashcards context
 * Throws an error if used outside of FlashcardsProvider
 * @returns FlashcardsContextType - The flashcards context value
 */
export const useFlashcards = (): FlashcardsContextType => {
  const context = useContext(FlashcardsContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
};
