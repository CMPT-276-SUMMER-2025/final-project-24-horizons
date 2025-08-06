// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Interface representing a flashcard object
 */
export interface Flashcard {
  id: number;        // Unique identifier for the flashcard
  front: string;     // Front text of the flashcard (question/prompt)
  back: string;      // Back text of the flashcard (answer/response)
  date: string;      // Date associated with the flashcard
  createdAt: string; // Timestamp when the flashcard was created
  updatedAt: string; // Timestamp when the flashcard was last updated
}

/**
 * Interface for API error responses
 */
interface ErrorResponse {
  error: string;
}

/**
 * Centralized error handler for API responses
 * Parses error responses and throws appropriate error messages
 * @param response - The fetch response object
 * @throws Error with appropriate message based on status code
 */
const handleApiError = async (response: Response) => {
  let errorData: any;
  
  // Attempt to parse JSON error data from response
  try {
    errorData = await response.json();
  } catch {
    // If JSON parsing fails, create generic error object
    errorData = { error: `HTTP ${response.status}` };
  }

  // Handle authentication errors specifically
  if (response.status === 401) {
    throw new Error('Authentication failed. Please log in again.');
  }

  // Throw error with most descriptive message available
  throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
};

/**
 * Fetches all flashcards for the authenticated user from the backend
 * @returns Promise<Flashcard[]> - Array of user's flashcards
 * @throws Error if request fails or user is not authenticated
 */
export const fetchFlashcards = async (): Promise<Flashcard[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flashcards`, {
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

    // Parse and return flashcards data
    const data: Flashcard[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    throw error; // Re-throw for component handling
  }
};

/**
 * Creates a new flashcard on the backend for the authenticated user
 * @param front - Front text of the flashcard (question/prompt)
 * @param back - Back text of the flashcard (answer/response)
 * @returns Promise<Flashcard> - The newly created flashcard with server-generated data
 * @throws Error if creation fails or user is not authenticated
 */
export const addFlashcardToServer = async (front: string, back: string): Promise<Flashcard> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flashcards`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ front, back }), // Send flashcard data as JSON
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(`Failed to add flashcard: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    // Return the newly created flashcard with server-generated fields
    const data: Flashcard = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding flashcard:', error);
    throw error; // Re-throw for component handling
  }
};

/**
 * Deletes a specific flashcard from the backend
 * @param id - The unique identifier of the flashcard to delete
 * @returns Promise<void> - No return value on success
 * @throws Error if deletion fails or flashcard doesn't exist
 */
export const removeFlashcardFromServer = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flashcards/${id}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(`Failed to delete flashcard: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }
    // No response body expected for successful deletion
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    throw error; // Re-throw for component handling
  }
};

/**
 * Updates an existing flashcard on the backend
 * @param id - The unique identifier of the flashcard to update
 * @param front - New front text for the flashcard
 * @param back - New back text for the flashcard
 * @returns Promise<Flashcard> - The updated flashcard with new server data
 * @throws Error if update fails or flashcard doesn't exist
 */
export const updateFlashcardOnServer = async (id: number, front: string, back: string): Promise<Flashcard> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flashcards/${id}`, {
      method: 'PUT',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ front, back }), // Send updated flashcard data
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(`Failed to update flashcard: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    // Return the updated flashcard with new timestamps
    const data: Flashcard = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating flashcard:', error);
    throw error; // Re-throw for component handling
  }
};
