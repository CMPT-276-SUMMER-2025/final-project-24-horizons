import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchFlashcards, addFlashcardToServer, removeFlashcardFromServer, updateFlashcardOnServer } from './flashcardsApi';
import type { Flashcard } from './flashcardsApi';
import { useAuth } from './authContext';

// Context interface
interface FlashcardsContextType {
  flashcards: Flashcard[];
  addFlashcard: (front: string, back: string) => Promise<void>;
  removeFlashcard: (id: number) => Promise<void>;
  updateFlashcard: (id: number, front: string, back: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshFlashcards: () => Promise<void>;
}

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

interface FlashcardsProviderProps {
  children: ReactNode;
}

// Wrapper component
export const FlashcardsProvider: React.FC<FlashcardsProviderProps> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth context to check if user is logged in
  const { user, loading: authLoading } = useAuth();

  // Load flashcards from the backend
  const refreshFlashcards = async () => {
    if (!user) {
      setFlashcards([]);
      setError('Not logged in');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const serverFlashcards = await fetchFlashcards();
      setFlashcards(serverFlashcards);
    } catch (err: any) {
      console.error('Failed to load flashcards:', err);
      
      // Check if it's an authentication error
      if (err.message.includes('401') || err.message.includes('No token') || err.message.includes('Invalid token')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load flashcards. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add new flashcard
  const addFlashcard = async (front: string, back: string) => {
    if (!user) {
      setError('Must be logged in to create flashcards');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newFlashcard = await addFlashcardToServer(front, back);
      setFlashcards(prevFlashcards => [newFlashcard, ...prevFlashcards]);
    } catch (err: any) {
      console.error('Failed to add flashcard:', err);
      
      if (err.message.includes('401') || err.message.includes('No token') || err.message.includes('Invalid token')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to create flashcard. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove flashcard
  const removeFlashcard = async (id: number) => {
    if (!user) {
      setError('Must be logged in to delete flashcards');
      return;
    }

    setError(null);
    try {
      await removeFlashcardFromServer(id);
      setFlashcards(prevFlashcards => prevFlashcards.filter(flashcard => flashcard.id !== id));
    } catch (err: any) {
      console.error('Failed to delete flashcard:', err);
      
      if (err.message.includes('401') || err.message.includes('No token') || err.message.includes('Invalid token')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to delete flashcard. Please try again.');
      }
      throw err;
    }
  };

  // Update flashcard
  const updateFlashcard = async (id: number, front: string, back: string) => {
    if (!user) {
      setError('Must be logged in to update flashcards');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedFlashcard = await updateFlashcardOnServer(id, front, back);
      setFlashcards(prevFlashcards => 
        prevFlashcards.map(flashcard => 
          flashcard.id === id ? updatedFlashcard : flashcard
        )
      );
    } catch (err: any) {
      console.error('Failed to update flashcard:', err);
      
      if (err.message.includes('401') || err.message.includes('No token') || err.message.includes('Invalid token')) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to update flashcard. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load flashcards when user changes or component mounts
  useEffect(() => {
    if (!authLoading && user) {
      refreshFlashcards();
    } else if (!authLoading && !user) {
      // User is not logged in, clear flashcards
      setFlashcards([]);
      setError(null);
    }
  }, [user, authLoading]);

  const value: FlashcardsContextType = {
    flashcards,
    addFlashcard,
    removeFlashcard,
    updateFlashcard,
    isLoading,
    error,
    refreshFlashcards,
  };

  return (
    <FlashcardsContext.Provider value={value}>
      {children}
    </FlashcardsContext.Provider>
  );
};

// Hook for components to access flashcards context
export const useFlashcards = (): FlashcardsContextType => {
  const context = useContext(FlashcardsContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
};
