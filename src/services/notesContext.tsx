import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchNotes, addNoteToServer, removeNoteFromServer, updateNoteOnServer } from './notesApi';
import type { Note } from './notesApi';
import { useAuth } from './authContext';

// Context interface
interface NotesContextType {
  notes: Note[];
  addNote: (title: string, content: string) => Promise<void>;
  removeNote: (id: number) => Promise<void>;
  updateNote: (id: number, title: string, content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshNotes: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

// Wrapper component
export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth context to check if user is logged in
  const { user, loading: authLoading } = useAuth();

  // Load notes from the backend
  const refreshNotes = React.useCallback(async () => {
    if (!user) {
      setNotes([]); // Empty notes for unauthenticated users
      setError('Not logged in');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const serverNotes = await fetchNotes();
      setNotes(serverNotes);
    } catch (err: unknown) {
      console.error('Failed to load notes:', err);
      
      // Check if it's an authentication error
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('401') || errorMessage.includes('No token') || errorMessage.includes('Invalid token')) {
        console.log('User not authenticated, using empty notes');
        setNotes([]);
        setError('Not logged in');
      } else {
        setError(errorMessage || 'Failed to load notes');
        // Keep existing notes on non-auth errors
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add a new note
  const addNote = async (title: string, content: string) => {
    if (!user) {
      setError('Please log in to save notes');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newNote = await addNoteToServer(title, content);
      setNotes(prevNotes => [...prevNotes, newNote]);
    } catch (err: unknown) {
      console.error('Failed to add note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMessage);
      throw err; // Re-throw so component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a note
  const removeNote = async (id: number) => {
    if (!user) {
      setError('Please log in to delete notes');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await removeNoteFromServer(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (err: unknown) {
      console.error('Failed to remove note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove note';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a note
  const updateNote = async (id: number, title: string, content: string) => {
    if (!user) {
      setError('Please log in to update notes');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedNote = await updateNoteOnServer(id, title, content);
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? updatedNote : note
        )
      );
    } catch (err: unknown) {
      console.error('Failed to update note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
      setError(errorMessage);
      throw err; // Re-throw so component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Load notes when component mounts or when user authentication changes
  useEffect(() => {
    if (!authLoading) { // Wait for auth to finish loading
      refreshNotes();
    }
  }, [user, authLoading, refreshNotes]);

  const value: NotesContextType = {
    notes,
    addNote,
    removeNote,
    updateNote,
    isLoading,
    error,
    refreshNotes,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

// Custom hook to use the notes context
export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
