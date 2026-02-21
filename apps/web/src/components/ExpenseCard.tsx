import { fromCents } from '@pinxesplit/shared';
import type { Expense } from '../hooks/useExpenses';
import { getCurrencyScale } from '../utils/currency';

interface ExpenseCardProps {
  expense: Expense;
  onClick?: () => void;
}

export function ExpenseCard({ expense, onClick }: ExpenseCardProps) {
  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const scale = getCurrencyScale(expense.currency);

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Category Icon */}
          {expense.category && (
            <div className="flex items-center space-x-2 mb-2">
              {expense.category.icon && (
                <span className="text-lg">{expense.category.icon}</span>
              )}
              <span className="text-xs text-gray-500">{expense.category.name}</span>
            </div>
          )}

          {/* Description */}
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {expense.description}
          </h3>

          {/* Paid by */}
          <p className="text-sm text-gray-600 mt-1">
            Paid by <span className="font-medium">{expense.paidBy.name}</span>
          </p>

          {/* Date */}
          <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
        </div>

        {/* Amount */}
        <div className="ml-4 text-right">
          <p className="text-xl font-bold text-gray-900">
            {expense.currency} {fromCents(expense.amount, scale).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}
          </p>
        </div>
      </div>
    </div>
  );
}
