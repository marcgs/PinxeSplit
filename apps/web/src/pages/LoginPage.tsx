import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DEV_USERS = [
  { email: 'alice@dev.local', name: 'Alice Anderson' },
  { email: 'bob@dev.local', name: 'Bob Builder' },
  { email: 'charlie@dev.local', name: 'Charlie Chen' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { mockLogin, isAuthenticated, checkMockAuthStatus } = useAuth();
  const [selectedEmail, setSelectedEmail] = useState(DEV_USERS[0].email);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockAuthEnabled, setMockAuthEnabled] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    checkMockAuthStatus().then(setMockAuthEnabled);
  }, [checkMockAuthStatus]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await mockLogin(selectedEmail);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!mockAuthEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">PinxeSplit</h1>
          <p className="text-center text-gray-600">
            Mock authentication is not available. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">PinxeSplit</h1>
        <p className="text-center text-gray-600 mb-6">
          Development Login
        </p>
        
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
              Select Dev User
            </label>
            <select
              id="user"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {DEV_USERS.map((user) => (
                <option key={user.email} value={user.email}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Development Mode:</strong> This is a mock authentication system for development only.
          </p>
        </div>
      </div>
    </div>
  );
}
