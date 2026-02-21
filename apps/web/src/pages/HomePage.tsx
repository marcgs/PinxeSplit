import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/PageContainer';
import { useOverallBalances } from '@/hooks/useBalances';
import { useGroups } from '@/hooks/useGroups';
import { formatCurrencyAmount } from '@/utils/currency';

export function HomePage() {
  const navigate = useNavigate();
  const { data: balancesData, isLoading: balancesLoading } = useOverallBalances();
  const { data: groups } = useGroups();

  const balances = balancesData?.balances ?? [];
  const owedToMe = balances.filter((b) => b.amount > 0);
  const iOwe = balances.filter((b) => b.amount < 0);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Your expense summary across all groups</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Overall Balance */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-3">Your Balance</h3>
            {balancesLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : balances.length === 0 ? (
              <p className="text-sm text-muted-foreground">You're all settled up!</p>
            ) : (
              <div className="space-y-1">
                {owedToMe.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">You are owed</p>
                    {owedToMe.map((b) => (
                      <p key={b.currency} className="text-sm font-medium text-green-600">
                        +{formatCurrencyAmount(b.amount, b.currency)}
                      </p>
                    ))}
                  </div>
                )}
                {iOwe.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">You owe</p>
                    {iOwe.map((b) => (
                      <p key={b.currency} className="text-sm font-medium text-red-600">
                        {formatCurrencyAmount(b.amount, b.currency)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Groups */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Your Groups</h3>
            {!groups || groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No groups yet.{' '}
                <button
                  onClick={() => navigate('/groups/new')}
                  className="text-primary underline"
                >
                  Create one!
                </button>
              </p>
            ) : (
              <div className="space-y-1">
                {groups.slice(0, 3).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/groups/${g.id}`)}
                    className="block w-full text-left text-sm hover:underline truncate"
                  >
                    {g.name}
                  </button>
                ))}
                {groups.length > 3 && (
                  <button
                    onClick={() => navigate('/groups')}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    +{groups.length - 3} more
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
            <p className="text-sm text-muted-foreground">
              {groups?.length ?? 0} group{groups?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

