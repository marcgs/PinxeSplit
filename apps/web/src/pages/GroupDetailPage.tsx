import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, UserPlus } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';
import { MemberList } from '@/components/MemberList';
import { AddMemberDialog } from '@/components/AddMemberDialog';
import { useGroup, useDeleteGroup, useAddMember, useRemoveMember } from '@/hooks/useGroups';
import { useAuthStore } from '@/stores/auth.store';

export function GroupDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members' | 'activity'>('members');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  const { data: group, isLoading, error } = useGroup(id || '');
  const deleteMutation = useDeleteGroup();
  const addMemberMutation = useAddMember(id || '');
  const removeMemberMutation = useRemoveMember(id || '');

  const handleDelete = async () => {
    if (!id || !group) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(id);
        navigate('/groups');
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Failed to delete group. Please try again.');
      }
    }
  };

  const handleAddMember = async (email: string) => {
    setAddMemberError(null);
    try {
      await addMemberMutation.mutateAsync({ email });
      setIsAddMemberOpen(false);
    } catch (error: any) {
      const message = error?.message || 'Failed to add member';
      setAddMemberError(message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!group) return;

    const member = group.members.find((m) => m.userId === userId);
    const isCurrentUser = user?.id === userId;

    const confirmed = window.confirm(
      isCurrentUser
        ? `Are you sure you want to leave "${group.name}"?`
        : `Are you sure you want to remove ${member?.user.name || 'this member'} from the group?`
    );

    if (confirmed) {
      try {
        await removeMemberMutation.mutateAsync(userId);
        if (isCurrentUser) {
          navigate('/groups');
        }
      } catch (error: any) {
        const message = error?.message || 'Failed to remove member';
        alert(message);
      }
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !group) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <p className="text-destructive">Group not found or you don't have access.</p>
        </div>
      </PageContainer>
    );
  }

  const isCreator = user?.id === group.createdById;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/groups')}
              className="rounded-md p-2 hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
              {group.description && (
                <p className="text-muted-foreground mt-1">{group.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/groups/${id}/edit`)}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            {isCreator && (
              <button
                onClick={handleDelete}
                className="rounded-md border border-destructive bg-background px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-6">
            {['expenses', 'balances', 'members', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'members' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Members ({group.members.length})
                </h3>
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </button>
              </div>
              <MemberList
                members={group.members}
                groupCreatorId={group.createdById}
                onRemoveMember={handleRemoveMember}
                isRemoving={removeMemberMutation.isPending}
              />
            </>
          )}

          {activeTab === 'expenses' && (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                No expenses yet. Expenses feature coming soon!
              </p>
            </div>
          )}

          {activeTab === 'balances' && (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                No balances to display. Balances feature coming soon!
              </p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                No activity yet. Activity feed coming soon!
              </p>
            </div>
          )}
        </div>
      </div>

      <AddMemberDialog
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setAddMemberError(null);
        }}
        onAddMember={handleAddMember}
        isLoading={addMemberMutation.isPending}
        error={addMemberError}
      />
    </PageContainer>
  );
}
