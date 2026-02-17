import { useEffect, useMemo } from 'react';
import { splitEvenly, fromCents } from '@pinxesplit/shared';
import type { SplitParticipant } from '../hooks/useSplitCalculator';

interface EqualSplitProps {
  participants: SplitParticipant[];
  totalAmount: number;
  currency: string;
  scale: number;
  payerId: string;
  onToggleParticipant: (userId: string) => void;
  onUpdate: () => void;
}

export function EqualSplit({
  participants,
  totalAmount,
  currency,
  scale,
  payerId,
  onToggleParticipant,
  onUpdate,
}: EqualSplitProps) {
  // Memoize the inclusion state to avoid unnecessary recalculations
  const inclusionState = useMemo(
    () => participants.map(p => p.included).join(','),
    [participants]
  );

  // Auto-compute splits when participants or amount changes
  useEffect(() => {
    onUpdate();
  }, [inclusionState, totalAmount, onUpdate]);

  const includedParticipants = participants.filter((p) => p.included);
  const splits = includedParticipants.length > 0
    ? splitEvenly(
        totalAmount,
        includedParticipants.map((p) => p.userId),
        payerId
      )
    : {};

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Split equally among selected participants. Any remainder will be added to the payer's share.
      </p>

      <div className="space-y-2">
        {participants.map((participant) => {
          const share = splits[participant.userId] || 0;
          const isCreator = participant.userId === payerId;

          return (
            <div
              key={participant.userId}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={participant.included}
                  onChange={() => onToggleParticipant(participant.userId)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {participant.name}
                    {isCreator && (
                      <span className="ml-2 text-xs text-gray-500">(Payer)</span>
                    )}
                  </p>
                </div>
              </div>

              {participant.included && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currency} {fromCents(share, scale).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {includedParticipants.length > 0 && totalAmount > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Per person (average)</span>
            <span className="font-medium text-gray-900">
              {currency}{' '}
              {fromCents(
                Math.floor(totalAmount / includedParticipants.length),
                scale
              ).toFixed(2)}
            </span>
          </div>
          {totalAmount % includedParticipants.length !== 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Remainder of {currency}{' '}
              {fromCents(totalAmount % includedParticipants.length, scale).toFixed(2)} added
              to payer
            </p>
          )}
        </div>
      )}
    </div>
  );
}
