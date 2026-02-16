import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomTabs } from './BottomTabs';

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Outlet />
      <BottomTabs />
    </div>
  );
}
