import { PageContainer } from '@/components/PageContainer';

export function ProfilePage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">User Information</h3>
              <p className="text-sm text-muted-foreground">
                Configure your profile settings here.
              </p>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-muted-foreground">Guest User</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">guest@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
