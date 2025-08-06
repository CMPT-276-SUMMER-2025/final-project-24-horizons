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
    console.log('🔐 Attempting Google login...');
    
    try {
      // Send POST request to backend with Google token
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session management
        body: JSON.stringify({ token: googleToken }),
      });

      console.log('📡 Auth response status:', response.status);
      
      // Handle non-successful HTTP responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Auth failed:', errorData);
        throw new Error(errorData.error || `Authentication failed (${response.status})`);
      }

      // Parse successful response and extract user data
      const data = await response.json();
      console.log('✅ Login successful for:', data.user.email);
      return data.user;
    } catch (error) {
      console.error('💥 Login error:', error);
      
      // Provide user-friendly error message for network issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  /**
   * Retrieves currently authenticated user from server session
   * @returns Promise that resolves to User object if authenticated, null if not
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('👤 Checking current user...');
      
      // Send GET request to check current session
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include', // Include session cookies
      });

      // If response is not OK, user is not authenticated
      if (!response.ok) {
        console.log('ℹ️ No valid session found');
        return null;
      }

      // Parse response and return user data
      const data = await response.json();
      console.log('✅ Current user found:', data.user.email);
      return data.user;
    } catch (error) {
      console.error('❌ Error checking current user:', error);
      return null; // Return null on any error to indicate no authentication
    }
  }

  /**
   * Logs out the current user by invalidating server session
   * @returns Promise that resolves when logout is complete
   * Note: Does not throw errors to ensure local state can be cleared regardless
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');
      
      // Send POST request to logout endpoint
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include session cookies for logout
      });
      
      if (response.ok) {
        console.log('✅ Logout successful');
      } else {
        console.warn('⚠️ Logout response not OK, but continuing...');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Intentionally not throwing error - we want to clear local state regardless
      // of server response to ensure user is logged out from frontend perspective
    }
  }
}

// Export singleton instance of AuthService for use throughout the application
export const authService = new AuthService();