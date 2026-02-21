import { ArrowRight } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currency';
import type { Debt, UserBalance } from '../hooks/useBalances';

interface DebtListProps {
  debts: Debt[];
  members: UserBalance[];
  onSettle?: (debt: Debt) => void;
  currentUserId?: string;
}

function getUserName(userId: string, members: UserBalance[]): string {
  const member = members.find((m) => m.userId === userId);
  return member?.user.name ?? userId;
}

export function DebtList({ debts, members, onSettle, currentUserId }: DebtListProps) {
  if (debts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No debts — everyone is settled up!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {debts.map((debt, i) => {
        const isCurrentUserDebtor = debt.from === currentUserId;
        return (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border bg-card p-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium truncate">
                {getUserName(debt.from, members)}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium truncate">
                {getUserName(debt.to, members)}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-sm font-semibold">
                {formatCurrencyAmount(debt.amount, debt.currency)}
              </span>
              {onSettle && isCurrentUserDebtor && (
                <button
                  onClick={() => onSettle(debt)}
                  className="text-xs rounded-md bg-primary px-2 py-1 text-primary-foreground hover:bg-primary/90"
                >
                  Settle
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
