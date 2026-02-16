import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = 'PinxeSplit', className }: HeaderProps) {
  return (
    <header className={cn('sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-primary">{title}</h1>
        </div>
      </div>
    </header>
  );
}
