import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fromCents } from '@pinxesplit/shared';
import { PageContainer } from '@/components/PageContainer';
import { useGroupBalances } from '@/hooks/useBalances';
import { useSettleUp } from '@/hooks/useBalances';
import { getCurrencyScale } from '@/utils/currency';

interface LocationState {
  toUserId?: string;
  amount?: number;
  currencyCode?: string;
}

export function SettleUpPage() {
  const navigate = useNavigate();
  const { id: groupId } = useParams();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};

  const { data } = useGroupBalances(groupId);

  const [toUserId, setToUserId] = useState(state.toUserId ?? '');
  const [currencyCode, setCurrencyCode] = useState(state.currencyCode ?? '');
  const [amountStr, setAmountStr] = useState(() => {
    if (state.amount && state.currencyCode) {
      const scale = getCurrencyScale(state.currencyCode);
      return fromCents(state.amount, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2);
    }
    return '';
  });

  const [formError, setFormError] = useState<string | null>(null);
  const settleUpMutation = useSettleUp(groupId ?? '');

  const members = data?.balances ?? [];
  const uniqueMembers = [...new Map(members.map((m) => [m.userId, m.user])).entries()];
  const currencies = [...new Set(members.map((m) => m.currency))];

  const selectedCurrencyCode = currencyCode || currencies[0] || 'USD';
  const scale = getCurrencyScale(selectedCurrencyCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!toUserId) {
      setFormError('Please select a recipient.');
      return;
    }

    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) {
      setFormError('Please enter a positive amount.');
      return;
    }

    const amountMinor = Math.round(parsed * scale);

    try {
      await settleUpMutation.mutateAsync({
        toUserId,
        amount: amountMinor,
        currencyCode: selectedCurrencyCode,
      });
      navigate(`/groups/${groupId}`, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to settle up.');
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-md mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/groups/${groupId}`)}
            className="rounded-md p-2 hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold">Settle Up</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Paying to</label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select recipient…</option>
              {uniqueMembers.map(([uid, u]) => (
                <option key={uid} value={uid}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Currency */}
          {currencies.length > 1 && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Currency</label>
              <select
                value={selectedCurrencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Amount ({selectedCurrencyCode})</label>
            <input
              type="number"
              min="0"
              step={scale === 1 ? '1' : scale === 1000 ? '0.001' : '0.01'}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <button
            type="submit"
            disabled={settleUpMutation.isPending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {settleUpMutation.isPending ? 'Settling…' : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
