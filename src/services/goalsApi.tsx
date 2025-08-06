// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Interface for successful goals API response
interface GoalsResponse {
  goals: string[];
}

// Interface for error response from API
interface ErrorResponse {
  error: string;
}

/**
 * Handles API error responses and throws appropriate error messages
 * @param response - The fetch Response object
 * @throws Error with appropriate message based on status code
 */
const handleApiError = async (response: Response) => {
  let errorData: any;
  try {
    // Try to parse error response as JSON
    errorData = await response.json();
  } catch {
    // Fallback if response is not valid JSON
    errorData = { error: `HTTP ${response.status}` };
  }

  // Handle authentication errors specifically
  if (response.status === 401) {
    throw new Error('Authentication failed. Please log in again.');
  }

  // Throw error with message from server or fallback message
  throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
};

/**
 * Fetches all goals for the authenticated user from the backend
 * @returns Promise<string[]> - Array of goal strings
 * @throws Error if request fails or user is not authenticated
 */
export const fetchGoals = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/goals`, {
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

    // Parse response and return goals array
    const data: GoalsResponse = await response.json();
    return data.goals;
  } catch {
    throw new Error('Error fetching goals');
  }
};

/**
 * Adds a new goal to the user's goal list on the backend
 * @param goal - The goal string to add
 * @returns Promise<string[]> - Updated array of all goals
 * @throws Error if request fails or user is not authenticated
 */
export const addGoalToServer = async (goal: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/goals`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal }), // Send goal in request body
    });

    // Check if request was successful
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to add goal: ${response.status}`);
    }

    // Parse response and return updated goals array
    const data: GoalsResponse = await response.json();
    return data.goals;
  } catch {
    throw new Error('Error adding goal');
  }
};

/**
 * Removes a goal from the user's goal list by its index position
 * @param index - The zero-based index of the goal to remove
 * @returns Promise<string[]> - Updated array of remaining goals
 * @throws Error if request fails or user is not authenticated
 */
export const removeGoalFromServer = async (index: number): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/goals/${index}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if request was successful
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to remove goal: ${response.status}`);
    }

    // Parse response and return updated goals array
    const data: GoalsResponse = await response.json();
    return data.goals;
  } catch {
    throw new Error('Error removing goal');
  }
};

/**
 * Replaces all user goals with a new set of goals (bulk update)
 * @param goals - Array of goal strings to replace existing goals
 * @returns Promise<string[]> - The updated goals array from server
 * @throws Error if request fails or user is not authenticated
 */
export const updateGoalsOnServer = async (goals: string[]): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/goals`, {
      method: 'PUT',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goals }), // Send entire goals array in request body
    });

    // Check if request was successful
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to update goals: ${response.status}`);
    }

    // Parse response and return updated goals array
    const data: GoalsResponse = await response.json();
    return data.goals;
  } catch {
    throw new Error('Error updating goals');
  }
};
