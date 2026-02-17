import { Trash2 } from 'lucide-react';
import type { GroupMember } from '../hooks/useGroups';
import { useAuthStore } from '../stores/auth.store';

interface MemberListProps {
  members: GroupMember[];
  groupCreatorId: string;
  onRemoveMember: (userId: string) => void;
  isRemoving?: boolean;
}

export function MemberList({ members, groupCreatorId, onRemoveMember, isRemoving }: MemberListProps) {
  const { user } = useAuthStore();

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isCurrentUser = user?.id === member.userId;
        const isCreator = member.userId === groupCreatorId;
        const canRemove = user?.id === member.userId || !isCreator;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              {member.user.avatar ? (
                <img
                  src={member.user.avatar}
                  alt={member.user.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {member.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium">
                  {member.user.name}
                  {isCurrentUser && <span className="text-muted-foreground ml-1">(You)</span>}
                </p>
                <p className="text-sm text-muted-foreground">{member.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isCreator && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Owner
                </span>
              )}
              {canRemove && (
                <button
                  onClick={() => onRemoveMember(member.userId)}
                  disabled={isRemoving}
                  className="rounded-md p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  title={isCurrentUser ? 'Leave group' : 'Remove member'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
