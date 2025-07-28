const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://studysync-backend.uttamsharma.com';

interface GoalsResponse {
  goals: string[];
}

interface ErrorResponse {
  error: string;
}

// Get user's goals from the backend
export const fetchGoals = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/goals`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch goals: ${response.status}`);
    }

    const data: GoalsResponse = await response.json();
    return data.goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

// Add a new goal to the backend
export const addGoalToServer = async (goal: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/goals`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goal }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to add goal: ${response.status}`);
    }

    const data: GoalsResponse = await response.json();
    return data.goals;
  } catch (error) {
    console.error('Error adding goal:', error);
    throw error;
  }
};

// Remove a goal from the backend by index
export const removeGoalFromServer = async (index: number): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/goals/${index}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to remove goal: ${response.status}`);
    }

    const data: GoalsResponse = await response.json();
    return data.goals;
  } catch (error) {
    console.error('Error removing goal:', error);
    throw error;
  }
};

// Update all goals on the backend (bulk update)
export const updateGoalsOnServer = async (goals: string[]): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/goals`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ goals }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || `Failed to update goals: ${response.status}`);
    }

    const data: GoalsResponse = await response.json();
    return data.goals;
  } catch (error) {
    console.error('Error updating goals:', error);
    throw error;
  }
};
