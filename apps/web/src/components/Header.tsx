import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = 'PinxeSplit', className }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-primary">{title}</h1>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
