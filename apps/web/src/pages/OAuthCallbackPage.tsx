import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  
  useEffect(() => {
    // Parse tokens from URL
    // ⚠️ SECURITY NOTE: Reading tokens from URL is NOT recommended for production!
    // This matches the backend approach for development. For production, use a more secure method.
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }
    
    if (accessToken && refreshToken) {
      handleOAuthCallback(accessToken, refreshToken);
      // Clean URL to remove tokens from browser history
      window.history.replaceState({}, document.title, '/auth/callback');
      // Redirect to home
      navigate('/', { replace: true });
    } else {
      navigate('/login?error=missing_tokens');
    }
  }, [navigate, handleOAuthCallback]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Completing sign-in...</h1>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
