import { Link, useLocation } from 'react-router-dom';
import { Home, Users, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'groups', label: 'Groups', icon: Users, path: '/groups' },
  { id: 'expenses', label: 'Expenses', icon: DollarSign, path: '/expenses' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export function BottomTabs() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1',
                'transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
