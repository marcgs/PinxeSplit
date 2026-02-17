import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { apiClient } from '../lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * OAuth Callback Page
 * Handles the OAuth redirect from the backend
 * Extracts tokens from URL params and loads user data
 * 
 * ⚠️ SECURITY WARNING: This implementation extracts tokens from URL parameters.
 * This is insecure for production as tokens are exposed in:
 * - Browser history
 * - Server logs
 * - Referrer headers
 * 
 * For production, implement:
 * - Secure httpOnly cookies
 * - One-time authorization code exchange
 * - State parameter validation
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    void (async function handleOAuthCallback() {
      try {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login?error=' + error, { replace: true });
          return;
        }

        if (!accessToken || !refreshToken) {
          console.error('Missing tokens in OAuth callback');
          navigate('/login?error=missing_tokens', { replace: true });
          return;
        }

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Load user data
        const userData = await apiClient<User>('/api/v1/users/me');
        setUser(userData);

        // Redirect to dashboard
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        navigate('/login?error=callback_failed', { replace: true });
      }
    })();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Completing Sign In
        </h2>
        <p className="text-gray-600">
          Please wait while we log you in...
        </p>
      </div>
    </div>
  );
}
