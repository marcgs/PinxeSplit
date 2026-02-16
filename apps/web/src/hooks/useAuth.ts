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
   * Initiate Google OAuth flow
   * Opens Google sign-in in a popup or redirects to Google OAuth
   */
  async function loginWithGoogle(): Promise<void> {
    // Redirect to Google OAuth endpoint
    const googleAuthUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/auth/google`;
    window.location.href = googleAuthUrl;
  }
  
  /**
   * Initiate Apple Sign-In flow
   * Opens Apple sign-in in a popup or redirects to Apple OAuth
   */
  async function loginWithApple(): Promise<void> {
    // Redirect to Apple OAuth endpoint
    const appleAuthUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/auth/apple`;
    window.location.href = appleAuthUrl;
  }
  
  /**
   * Handle OAuth callback with tokens
   * Called after successful OAuth redirect
   */
  function handleOAuthCallback(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Load user data
    apiClient<User>('/api/v1/users/me')
      .then(userData => {
        setUser(userData);
      })
      .catch(error => {
        console.error('Error loading user after OAuth:', error);
        logout();
      });
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
  
  return {
    user,
    isAuthenticated,
    isLoading,
    mockLogin,
    loginWithGoogle,
    loginWithApple,
    handleOAuthCallback,
    logout,
    checkMockAuthStatus,
    updateProfile,
  };
}
