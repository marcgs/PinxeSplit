import { PageContainer } from '@/components/PageContainer';

export function HomePage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome to PinxeSplit</h2>
          <p className="text-muted-foreground">
            Split expenses easily with friends and groups
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              No recent expenses yet. Start by creating a group!
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Your Balance</h3>
            <p className="text-sm text-muted-foreground">
              You're all settled up!
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
            <p className="text-sm text-muted-foreground">
              0 groups • 0 expenses
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
