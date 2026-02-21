import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupBalances, type Debt, type UserBalance } from '../hooks/useBalances';
import { useAuthStore } from '../stores/auth.store';
import { BalanceCard } from '../components/BalanceCard';
import { DebtList } from '../components/DebtList';

interface GroupBalancePageProps {
  groupId: string;
}

export function GroupBalancePage({ groupId }: GroupBalancePageProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showSimplified, setShowSimplified] = useState(true);
  const { data, isLoading, error } = useGroupBalances(groupId);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading balances…</p>;
  }

  if (error || !data) {
    return <p className="text-destructive text-sm">Failed to load balances.</p>;
  }

  const { balances, debts, simplifiedDebts } = data;
  const displayedDebts = showSimplified ? simplifiedDebts : debts;

  // Group balances by userId for BalanceCard display
  const balancesByUser = new Map<string, UserBalance[]>();
  for (const b of balances) {
    const list = balancesByUser.get(b.userId) ?? [];
    list.push(b);
    balancesByUser.set(b.userId, list);
  }

  const handleSettle = (debt: Debt) => {
    navigate(`/groups/${groupId}/settle`, {
      state: { toUserId: debt.to, amount: debt.amount, currencyCode: debt.currency },
    });
  };

  return (
    <div className="space-y-6">
      {/* Per-member net balances */}
      <div className="space-y-3">
        {[...balancesByUser.entries()].map(([userId, userBalances]) => {
          const userInfo = userBalances[0]?.user;
          if (!userInfo) return null;

          return (
            <BalanceCard
              key={userId}
              name={userInfo.name}
              email={userInfo.email}
              avatar={userInfo.avatar}
              balances={userBalances}
            />
          );
        })}
      </div>

      {/* Debts section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Debts</h4>
          <button
            onClick={() => setShowSimplified((v) => !v)}
            className="text-xs text-primary underline"
          >
            {showSimplified ? 'Show original' : 'Show simplified'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {showSimplified
            ? `Simplified: ${simplifiedDebts.length} transfer${simplifiedDebts.length !== 1 ? 's' : ''}`
            : `Original: ${debts.length} transfer${debts.length !== 1 ? 's' : ''}`}
        </p>
        <DebtList
          debts={displayedDebts}
          members={balances}
          onSettle={handleSettle}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
