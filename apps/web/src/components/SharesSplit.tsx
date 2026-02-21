import { useEffect, useMemo } from 'react';
import { splitByShares, fromCents } from '@pinxesplit/shared';
import type { SplitParticipant } from '../hooks/useSplitCalculator';

interface SharesSplitProps {
  participants: SplitParticipant[];
  totalAmount: number;
  currency: string;
  scale: number;
  payerId: string;
  onToggleParticipant: (userId: string) => void;
  onUpdateShares: (userId: string, shares: number) => void;
  onUpdate: () => void;
}

export function SharesSplit({
  participants,
  totalAmount,
  currency,
  scale,
  payerId,
  onToggleParticipant,
  onUpdateShares,
  onUpdate,
}: SharesSplitProps) {
  // Memoize the shares state to avoid unnecessary recalculations
  const sharesState = useMemo(
    () => participants.map(p => `${p.included}:${p.shares}`).join(','),
    [participants]
  );

  // Auto-update when shares change
  useEffect(() => {
    onUpdate();
  }, [sharesState, totalAmount, onUpdate]);

  const includedParticipants = participants.filter((p) => p.included);
  const totalShares = includedParticipants.reduce((sum, p) => sum + (p.shares || 1), 0);

  // Calculate amounts
  let computedAmounts: Record<string, number> = {};
  try {
    if (includedParticipants.length > 0) {
      const shares = includedParticipants.map((p) => ({
        id: p.userId,
        shares: p.shares || 1,
      }));
      computedAmounts = splitByShares(totalAmount, shares, payerId);
    }
  } catch (error) {
    // Ignore calculation errors
  }

  const handleSharesChange = (userId: string, value: string) => {
    const shares = parseInt(value) || 1;
    onUpdateShares(userId, Math.max(1, shares));
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Split by ratio. For example, if one person has 2 shares and another has 1 share, the first
        person pays 2/3 of the total. Any remainder will be added to the payer's share.
      </p>

      <div className="space-y-2">
        {participants.map((participant) => {
          const computedAmount = computedAmounts[participant.userId] || 0;
          const shareRatio =
            totalShares > 0 ? ((participant.shares || 1) / totalShares) * 100 : 0;
          const isCreator = participant.userId === payerId;

          return (
            <div
              key={participant.userId}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={participant.included}
                  onChange={() => onToggleParticipant(participant.userId)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {participant.name}
                      {isCreator && (
                        <span className="ml-2 text-xs text-gray-500">(Payer)</span>
                      )}
                    </p>
                  </div>
                  {participant.included && computedAmount > 0 && (
                    <p className="text-xs text-gray-500">
                      {currency} {fromCents(computedAmount, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)} (
                      {shareRatio.toFixed(1)}%)
                    </p>
                  )}
                </div>
              </div>

              {participant.included && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={participant.shares || 1}
                    onChange={(e) => handleSharesChange(participant.userId, e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">
                    {(participant.shares || 1) === 1 ? 'share' : 'shares'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Shares Info */}
      {includedParticipants.length > 0 && totalAmount > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total shares</span>
            <span className="font-medium text-gray-900">{totalShares}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Per share</span>
            <span className="font-medium text-gray-900">
              {currency} {fromCents(Math.floor(totalAmount / totalShares), scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
            </span>
          </div>
          {totalAmount % totalShares !== 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Remainder of {currency}{' '}
              {fromCents(totalAmount % totalShares, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)} added to payer
            </p>
          )}
        </div>
      )}
    </div>
  );
}
