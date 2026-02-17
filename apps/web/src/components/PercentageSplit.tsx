import { fromCents, splitByPercentages } from '@pinxesplit/shared';
import type { SplitParticipant } from '../hooks/useSplitCalculator';

interface PercentageSplitProps {
  participants: SplitParticipant[];
  totalAmount: number;
  currency: string;
  scale: number;
  onToggleParticipant: (userId: string) => void;
  onUpdatePercentage: (userId: string, percentage: number) => void;
  onUpdate: () => void;
}

export function PercentageSplit({
  participants,
  totalAmount,
  currency,
  scale,
  onToggleParticipant,
  onUpdatePercentage,
  onUpdate,
}: PercentageSplitProps) {
  const includedParticipants = participants.filter((p) => p.included);
  const totalPercentage = includedParticipants.reduce(
    (sum, p) => sum + (p.percentage || 0),
    0
  );

  const handlePercentageChange = (userId: string, value: string) => {
    const percentage = parseFloat(value) || 0;
    onUpdatePercentage(userId, percentage);
    onUpdate();
  };

  // Calculate amounts for display
  let computedAmounts: Record<string, number> = {};
  try {
    if (includedParticipants.length > 0 && Math.abs(totalPercentage - 100) < 0.01) {
      const percentages = includedParticipants.map((p) => ({
        id: p.userId,
        percentage: p.percentage || 0,
      }));
      // Use first participant as creator for remainder distribution
      computedAmounts = splitByPercentages(
        totalAmount,
        percentages,
        includedParticipants[0].userId
      );
    }
  } catch (error) {
    // Ignore calculation errors during input
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter percentage for each participant. Total must equal 100%.
      </p>

      <div className="space-y-2">
        {participants.map((participant) => {
          const computedAmount = computedAmounts[participant.userId] || 0;

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
                  <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                  {participant.included && computedAmount > 0 && (
                    <p className="text-xs text-gray-500">
                      {currency} {fromCents(computedAmount, scale).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {participant.included && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={participant.percentage || 0}
                    onChange={(e) => handlePercentageChange(participant.userId, e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Percentage */}
      <div
        className={`rounded-lg p-3 ${
          Math.abs(totalPercentage - 100) < 0.01 ? 'bg-green-50' : 'bg-yellow-50'
        }`}
      >
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total percentage</span>
          <span
            className={`font-medium ${
              Math.abs(totalPercentage - 100) < 0.01
                ? 'text-green-700'
                : 'text-yellow-700'
            }`}
          >
            {totalPercentage.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Required</span>
          <span className="font-medium text-gray-900">100%</span>
        </div>
      </div>

      {Math.abs(totalPercentage - 100) >= 0.01 && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                {totalPercentage > 100
                  ? `Percentages exceed 100%. Reduce by ${(totalPercentage - 100).toFixed(2)}%`
                  : `Percentages are less than 100%. Add ${(100 - totalPercentage).toFixed(2)}%`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
