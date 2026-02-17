import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';
import { GroupCard } from '@/components/GroupCard';
import { useGroups } from '@/hooks/useGroups';

export function GroupsPage() {
  const navigate = useNavigate();
  const { data: groups, isLoading, error } = useGroups();

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">Error loading groups. Please try again.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Groups</h2>
          <button
            onClick={() => navigate('/groups/new')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </button>
        </div>

        {!groups || groups.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No groups yet. Create your first group to start splitting expenses!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => navigate(`/groups/${group.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
