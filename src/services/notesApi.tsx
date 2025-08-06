// Base URL for API endpoints, loaded from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Interface defining the structure of a Note object
export interface Note {
  id: number;          // Unique identifier for the note
  title: string;       // Note title
  content: string;     // Note content/body
  date: string;        // Date string for display
  createdAt: string;   // Timestamp when note was created
  updatedAt: string;   // Timestamp when note was last updated
}

// Interface for API error responses
interface ErrorResponse {
  error: string;       // Error message from the server
}

/**
 * Centralized error handling for API responses
 * @param response - The fetch Response object
 * @throws Error with appropriate message based on status code
 */
const handleApiError = async (response: Response) => {
  let errorData: any;
  
  // Try to parse error response as JSON, fallback to generic error
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: `HTTP ${response.status}` };
  }

  // Handle authentication errors specifically
  if (response.status === 401) {
    throw new Error('Authentication failed. Please log in again.');
  }

  // Throw error with server message or fallback message
  throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
};

/**
 * Fetch all notes for the authenticated user from the backend
 * @returns Promise<Note[]> - Array of user's notes
 * @throws Error if request fails or user is not authenticated
 */
export const fetchNotes = async (): Promise<Note[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notes`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if request was successful
    if (!response.ok) {
      await handleApiError(response);
    }

    // Parse and return the notes data
    const data: Note[] = await response.json();
    return data;
  } catch {
    throw new Error('Error fetching notes');
  }
};

/**
 * Create a new note on the server
 * @param title - Title of the new note
 * @param content - Content/body of the new note
 * @returns Promise<Note> - The created note with server-generated fields
 * @throws Error if creation fails or user is not authenticated
 */
export const addNoteToServer = async (title: string, content: string): Promise<Note> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notes`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }), // Send note data as JSON
    });

    // Check if request was successful
    if (!response.ok) {
      await handleApiError(response);
    }

    // Parse and return the created note
    const data: Note = await response.json();
    return data;
  } catch {
    throw new Error('Error adding note');
  }
};

/**
 * Delete a note from the server by its ID
 * @param id - Unique identifier of the note to delete
 * @returns Promise<void> - Resolves when deletion is successful
 * @throws Error if deletion fails or user is not authenticated
 */
export const removeNoteFromServer = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if request was successful
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to remove note: ${response.status}`);
    }
    // Note: No return data needed for successful deletion
  } catch {
    throw new Error('Error removing note');
  }
};

/**
 * Update an existing note on the server
 * @param id - Unique identifier of the note to update
 * @param title - New title for the note
 * @param content - New content for the note
 * @returns Promise<Note> - The updated note with new timestamp
 * @throws Error if update fails or user is not authenticated
 */
export const updateNoteOnServer = async (id: number, title: string, content: string): Promise<Note> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
      method: 'PUT',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }), // Send updated note data as JSON
    });

    // Check if request was successful
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to update note: ${response.status}`);
    }

    // Parse and return the updated note
    const data: Note = await response.json();
    return data;
  } catch {
    throw new Error('Error updating note');
  }
};
