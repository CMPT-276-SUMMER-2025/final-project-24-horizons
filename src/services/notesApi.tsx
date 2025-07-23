const API_BASE_URL = 'http://localhost:3009/api'; // Same as goals API

export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  error: string;
}

// Get user's notes from the backend
export const fetchNotes = async (): Promise<Note[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notes: ${response.status}`);
    }

    const data: Note[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

// Add a new note to the backend
export const addNoteToServer = async (title: string, content: string): Promise<Note> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to add note: ${response.status}`);
    }

    const data: Note = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

// Remove a note from the backend by ID
export const removeNoteFromServer = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to remove note: ${response.status}`);
    }
  } catch (error) {
    console.error('Error removing note:', error);
    throw error;
  }
};

// Update a note on the backend
export const updateNoteOnServer = async (id: number, title: string, content: string): Promise<Note> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to update note: ${response.status}`);
    }

    const data: Note = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};
