// Base URL for API requests, loaded from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * User interface representing the authenticated user data structure
 */
export interface User {
  id: string;      // Unique identifier for the user
  email: string;   // User's email address
  name: string;    // User's display name
  picture: string; // URL to user's profile picture
}

/**
 * AuthService class handles all authentication-related operations
 * including Google OAuth login, session management, and logout
 */
class AuthService {
  /**
   * Authenticates user using Google OAuth token
   * @param googleToken - JWT token received from Google OAuth
   * @returns Promise that resolves to User object on successful authentication
   * @throws Error if authentication fails or server is unreachable
   */
  async loginWithGoogle(googleToken: string): Promise<User> {
    // Send POST request to backend with Google token
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token: googleToken }),
    });

    // Handle non-successful HTTP responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Authentication failed (${response.status})`);
    }

    // Parse successful response and extract user data
    const data = await response.json();
    return data.user;
  }

  /**
   * Retrieves currently authenticated user from server session
   * @returns Promise that resolves to User object if authenticated, null if not
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      
      // Send GET request to check current session
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include', // Include session cookies
      });

      // If response is not OK, user is not authenticated
      if (!response.ok) {
        return null;
      }

      // Parse response and return user data
      const data = await response.json();
      return data.user;
    } catch {
      return null; // Return null on any error to indicate no authentication
    }
  }

  /**
   * Logs out the current user by invalidating server session
   * @returns Promise that resolves when logout is complete
   * Note: Does not throw errors to ensure local state can be cleared regardless
   */
  async logout(): Promise<void> {
      
      // Send POST request to logout endpoint
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include session cookies for logout
      });

  }
}

// Export singleton instance of AuthService for use throughout the application
export const authService = new AuthService();