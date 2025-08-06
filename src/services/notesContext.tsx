import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { fetchNotes, addNoteToServer, removeNoteFromServer, updateNoteOnServer } from './notesApi';
import type { Note } from './notesApi';
import { useAuth } from './authContext';

// Context interface defining the shape of the notes context
interface NotesContextType {
  notes: Note[]; // Array of all user notes
  addNote: (title: string, content: string) => Promise<void>; // Function to add a new note
  removeNote: (id: number) => Promise<void>; // Function to remove a note by ID
  updateNote: (id: number, title: string, content: string) => Promise<void>; // Function to update an existing note
  isLoading: boolean; // Loading state for async operations
  error: string | null; // Error message if any operation fails
  refreshNotes: () => Promise<void>; // Function to refresh notes from server
}

// Create the context with undefined as default (will throw error if used without provider)
const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Props interface for the NotesProvider component
interface NotesProviderProps {
  children: ReactNode; // Child components that will have access to the notes context
}

/**
 * NotesProvider component that manages all notes state and operations
 * Provides notes functionality to all child components through React Context
 */
export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  // State management for notes data
  const [notes, setNotes] = useState<Note[]>([]); // Local notes state
  const [isLoading, setIsLoading] = useState(false); // Loading indicator for async operations
  const [error, setError] = useState<string | null>(null); // Error state for failed operations

  // Get authentication context to check user login status
  const { user, loading: authLoading } = useAuth();

  /**
   * Refreshes notes from the server
   * Only loads notes if user is authenticated
   * Handles authentication errors and displays appropriate messages
   */
  const refreshNotes = React.useCallback(async () => {
    // If no user is logged in, clear notes and return
    if (!user) {
      setNotes([]);
      setError(null);
      return;
    }

    // Set loading state and clear any previous errors
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch notes from the server
      const serverNotes = await fetchNotes();
      setNotes(serverNotes);
    } catch (err: unknown) {
      
      // Handle different types of errors appropriately
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('Authentication failed')) {
        // Clear notes if authentication fails
        setNotes([]);
        setError('Please log in to view your notes');
      } else {
        setError(errorMessage || 'Failed to load notes');
      }
    } finally {
      // Always clear loading state when done
      setIsLoading(false);
    }
  }, [user]); // Dependency on user to re-run when authentication changes

  /**
   * Adds a new note to the server and updates local state
   * @param title - The title of the new note
   * @param content - The content of the new note
   */
  const addNote = async (title: string, content: string) => {
    // Check if user is authenticated before proceeding
    if (!user) {
      setError('Please log in to save notes');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Add note to server and get the created note with ID
      const newNote = await addNoteToServer(title, content);
      // Add the new note to local state
      setNotes(prevNotes => [...prevNotes, newNote]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add note';
      setError(errorMessage);
      throw err; // Re-throw so calling component can handle the error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Removes a note from the server and updates local state
   * @param id - The ID of the note to remove
   */
  const removeNote = async (id: number) => {
    // Check if user is authenticated before proceeding
    if (!user) {
      setError('Please log in to delete notes');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Remove note from server
      await removeNoteFromServer(id);
      // Remove note from local state by filtering out the deleted note
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove note';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates an existing note on the server and in local state
   * @param id - The ID of the note to update
   * @param title - The new title for the note
   * @param content - The new content for the note
   */
  const updateNote = async (id: number, title: string, content: string) => {
    // Check if user is authenticated before proceeding
    if (!user) {
      setError('Please log in to update notes');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Update note on server and get the updated note
      const updatedNote = await updateNoteOnServer(id, title, content);
      // Update the note in local state by replacing the old note with the updated one
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? updatedNote : note
        )
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
      setError(errorMessage);
      throw err; // Re-throw so calling component can handle the error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect to load notes when the component mounts or when authentication state changes
   * Waits for authentication loading to complete before attempting to load notes
   */
  useEffect(() => {
    if (!authLoading) { // Only proceed once auth loading is complete
      refreshNotes();
    }
  }, [user, authLoading, refreshNotes]); // Re-run when user or auth loading state changes

  // Create the context value object with all the state and functions
  const value: NotesContextType = {
    notes,
    addNote,
    removeNote,
    updateNote,
    isLoading,
    error,
    refreshNotes,
  };

  // Provide the context value to all child components
  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

/**
 * Custom hook to access the notes context
 * Throws an error if used outside of a NotesProvider
 * @returns The notes context containing all notes state and operations
 */
export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  
  // Ensure the hook is used within a NotesProvider
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
