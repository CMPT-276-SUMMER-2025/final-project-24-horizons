const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://studysync-backend.uttamsharma.com';

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  error: string;
}

const handleApiError = async (response: Response) => {
  let errorData: any;
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: `HTTP ${response.status}` };
  }

  if (response.status === 401) {
    throw new Error('Authentication failed. Please log in again.');
  }

  throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
};

// Get user's flashcards from the backend
export const fetchFlashcards = async (): Promise<Flashcard[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flashcards`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    const data: Flashcard[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    throw error;
  }
};

// Add a new flashcard to the backend
export const addFlashcardToServer = async (front: string, back: string): Promise<Flashcard> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flashcards`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ front, back }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(`Failed to add flashcard: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data: Flashcard = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding flashcard:', error);
    throw error;
  }
};

// Delete a flashcard from the backend
export const removeFlashcardFromServer = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flashcards/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(`Failed to delete flashcard: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    throw error;
  }
};

// Update a flashcard on the backend
export const updateFlashcardOnServer = async (id: number, front: string, back: string): Promise<Flashcard> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flashcards/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ front, back }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(`Failed to update flashcard: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data: Flashcard = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating flashcard:', error);
    throw error;
  }
};
