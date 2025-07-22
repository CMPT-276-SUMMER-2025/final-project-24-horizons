import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 AuthProvider: Checking authentication...');
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          console.log('✅ AuthProvider: User authenticated:', currentUser.email);
        } else {
          console.log('ℹ️ AuthProvider: No authenticated user');
        }
      } catch (error) {
        console.error('❌ AuthProvider: Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      console.log('🚪 AuthProvider: Logging out...');
      await authService.logout();
      setUser(null);
      console.log('✅ AuthProvider: Logout successful');
    } catch (error) {
      console.error('❌ AuthProvider: Logout failed:', error);
      // Clear user state even if logout request fails
      setUser(null);
    }
  };

  const contextValue = {
    user,
    loading,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}