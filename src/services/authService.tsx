const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

class AuthService {
  async loginWithGoogle(googleToken: string): Promise<User> {
    console.log('🔐 Attempting Google login...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: googleToken }),
      });

      console.log('📡 Auth response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Auth failed:', errorData);
        throw new Error(errorData.error || `Authentication failed (${response.status})`);
      }

      const data = await response.json();
      console.log('✅ Login successful for:', data.user.email);
      return data.user;
    } catch (error) {
      console.error('💥 Login error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('👤 Checking current user...');
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.log('ℹ️ No valid session found');
        return null;
      }

      const data = await response.json();
      console.log('✅ Current user found:', data.user.email);
      return data.user;
    } catch (error) {
      console.error('❌ Error checking current user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        console.log('✅ Logout successful');
      } else {
        console.warn('⚠️ Logout response not OK, but continuing...');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Don't throw error for logout - we want to clear local state regardless
    }
  }
}

export const authService = new AuthService();