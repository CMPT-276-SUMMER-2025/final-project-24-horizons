import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { User } from '../services/authService';

/**
 * Interface defining the shape of the authentication context
 * Contains user state, loading state, and authentication actions
 */
interface AuthContextType {
  user: User | null; // Current authenticated user or null if not logged in
  setUser: (user: User | null) => void; // Function to manually update user state
  loading: boolean; // Indicates if authentication check is in progress
  logout: () => Promise<void>; // Function to log out the current user
}

// Create the authentication context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the application to provide authentication state
 * Manages user authentication state and provides it to child components
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State to store the currently authenticated user
  const [user, setUser] = useState<User | null>(null);
  // State to track if initial authentication check is in progress
  const [loading, setLoading] = useState(true);

  // Effect to check authentication status when the component mounts
  useEffect(() => {
    /**
     * Asynchronous function to check if user is already authenticated
     * Called once when the AuthProvider component mounts
     */
    const checkAuth = async () => {
      try {
        // Attempt to get the current user from the auth service
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        // Handle error silently
      } finally {
        // Always set loading to false when check is complete
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Logout function that clears user state and calls auth service logout
   * Handles any errors that occur during logout process
   */
  const logout = async () => {
    try {
      // Call the logout method from auth service
      await authService.logout();
      // Clear the user state
      setUser(null);
    } catch {
      // Handle error silently
    }
  };

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the authentication context
 * Throws an error if used outside of an AuthProvider
 * @returns The authentication context containing user state and actions
 */
export function useAuth() {
  const context = useContext(AuthContext);
  // Ensure the hook is used within an AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}