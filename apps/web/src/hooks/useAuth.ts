import { useEffect } from 'react';
import { useAuthStore, type User } from '../stores/auth.store';
import { apiClient } from '../lib/api-client';

interface MockLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface MockAuthStatus {
  enabled: boolean;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();
  
  // Load user on mount if access token exists
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    
    async function loadUser() {
      try {
        const userData = await apiClient<User>('/api/v1/users/me');
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        logout();
      }
    }
    
    if (accessToken && !user) {
      loadUser();
    } else if (!accessToken) {
      setLoading(false);
    }
  }, [user, setLoading, setUser, logout]);
  
  async function mockLogin(email: string) {
    try {
      const data = await apiClient<MockLoginResponse>('/api/v1/auth/mock', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      
      return data.user;
    } catch (error) {
      console.error('Error during mock login:', error);
      throw error;
    }
  }
  
  async function checkMockAuthStatus(): Promise<boolean> {
    try {
      const data = await apiClient<MockAuthStatus>('/api/v1/auth/mock/status');
      return data.enabled;
    } catch (error) {
      console.error('Error checking mock auth status:', error);
      return false;
    }
  }
  
  /**
   * Initiate Google OAuth login flow
   * Redirects to backend OAuth endpoint
   */
  function loginWithGoogle() {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/auth/google`;
  }
  
  /**
   * Initiate Apple OAuth login flow
   * Redirects to backend OAuth endpoint
   */
  function loginWithApple() {
    // Redirect to backend Apple OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/auth/apple`;
  }
  
  async function updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    defaultCurrency?: string;
  }) {
    try {
      const updatedUser = await apiClient<User>('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
  
  async function handleLogout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call backend to revoke refresh token
      if (refreshToken) {
        await apiClient('/api/v1/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }).catch((error) => {
          // Log error but continue with local logout
          console.error('Error revoking refresh token:', error);
        });
      }
      
      // Clear local storage and auth state
      logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if backend call fails, clear local state
      logout();
    }
  }
  
  return {
    user,
    isAuthenticated,
    isLoading,
    mockLogin,
    loginWithGoogle,
    loginWithApple,
    logout: handleLogout,
    checkMockAuthStatus,
    updateProfile,
  };
}
