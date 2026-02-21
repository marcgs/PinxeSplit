import { fromCents, toCents } from '@pinxesplit/shared';
import type { SplitParticipant } from '../hooks/useSplitCalculator';

interface AmountSplitProps {
  participants: SplitParticipant[];
  totalAmount: number;
  currency: string;
  scale: number;
  onToggleParticipant: (userId: string) => void;
  onUpdateAmount: (userId: string, amount: number) => void;
  onUpdate: () => void;
}

export function AmountSplit({
  participants,
  totalAmount,
  currency,
  scale,
  onToggleParticipant,
  onUpdateAmount,
  onUpdate,
}: AmountSplitProps) {
  const includedParticipants = participants.filter((p) => p.included);
  const currentTotal = includedParticipants.reduce((sum, p) => sum + (p.amount || 0), 0);
  const delta = currentTotal - totalAmount;

  const handleAmountChange = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const amountInCents = toCents(numValue, scale);
    onUpdateAmount(userId, amountInCents);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter exact amounts for each participant. Total must equal the expense amount.
      </p>

      <div className="space-y-2">
        {participants.map((participant) => (
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
              </div>
            </div>

            {participant.included && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{currency}</span>
                <input
                  type="number"
                  min="0"
                  step={scale === 1 ? '1' : scale === 1000 ? '0.001' : '0.01'}
                  value={fromCents(participant.amount || 0, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
                  onChange={(e) => handleAmountChange(participant.userId, e.target.value)}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Running Total */}
      <div
        className={`rounded-lg p-3 ${
          delta === 0 ? 'bg-green-50' : 'bg-yellow-50'
        }`}
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Current total</span>
            <span
              className={`font-medium ${
                delta === 0 ? 'text-green-700' : 'text-yellow-700'
              }`}
            >
              {currency} {fromCents(currentTotal, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Expense amount</span>
            <span className="font-medium text-gray-900">
              {currency} {fromCents(totalAmount, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600">Difference</span>
            <span
              className={`font-medium ${
                delta === 0
                  ? 'text-green-700'
                  : delta > 0
                  ? 'text-red-700'
                  : 'text-yellow-700'
              }`}
            >
              {delta > 0 ? '+' : ''}
              {currency} {fromCents(delta, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
            </span>
          </div>
        </div>
      </div>

      {delta !== 0 && (
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
                {delta > 0
                  ? 'Amounts exceed total. Reduce by '
                  : 'Amounts are less than total. Add '}
                {currency} {Math.abs(fromCents(delta, scale)).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
