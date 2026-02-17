import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroup } from '../hooks/useGroups';
import { useExpense, useCreateExpense, useUpdateExpense } from '../hooks/useExpenses';
import { toCents } from '@pinxesplit/shared';
import { PageContainer } from '../components/PageContainer';
import { SplitCalculator } from '../components/SplitCalculator';
import type { Split } from '../hooks/useSplitCalculator';

export function ExpenseFormPage() {
  const { groupId, expenseId } = useParams<{ groupId?: string; expenseId?: string }>();
  const navigate = useNavigate();
  const isEditing = !!expenseId;

  // Fetch group data
  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: expense, isLoading: expenseLoading } = useExpense(expenseId);
  
  const createExpense = useCreateExpense(groupId || '');
  const updateExpense = useUpdateExpense(expenseId || '');

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID (would come from auth context in real app)
  const currentUserId = group?.members[0]?.userId || '';

  // Pre-populate form when editing
  useEffect(() => {
    if (expense && isEditing) {
      setDescription(expense.description);
      setAmount((expense.amount / 100).toFixed(2));
      setDate(new Date(expense.date).toISOString().split('T')[0]);
      // Note: splits will be pre-populated via SplitCalculator's initialSplits prop
    }
  }, [expense, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!group) {
      setError('Group not found');
      return;
    }

    if (splits.length === 0) {
      setError('Please configure expense splits');
      return;
    }

    const amountInCents = toCents(parseFloat(amount), 100);

    const expenseData = {
      description,
      amount: amountInCents,
      currency: group.currency,
      paidById: splits[0]?.userId || currentUserId,
      date: new Date(date).toISOString(),
      splits,
    };

    try {
      if (isEditing) {
        await updateExpense.mutateAsync(expenseData);
        navigate(`/expenses/${expenseId}`);
      } else {
        const newExpense = await createExpense.mutateAsync(expenseData);
        navigate(`/expenses/${newExpense.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
    }
  };

  if (groupLoading || (isEditing && expenseLoading)) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (!group) {
    return (
      <PageContainer>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">Group not found.</p>
        </div>
      </PageContainer>
    );
  }

  const members = group.members.map((m) => ({
    userId: m.user.id,
    name: m.user.name,
  }));

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {group.name}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Expense Details</h2>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Dinner at restaurant"
              />
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount ({group.currency})
              </label>
              <input
                type="number"
                id="amount"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Split Calculator Card */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Split Expense
              </h2>
              <SplitCalculator
                members={members}
                defaultPayerId={currentUserId}
                amount={toCents(parseFloat(amount), 100)}
                currency={group.currency}
                scale={100}
                onSplitsChange={setSplits}
                initialSplits={expense?.splits.map((split) => ({
                  userId: split.userId,
                  paidShare: split.userId === expense.paidById ? expense.amount : 0,
                  owedShare: split.amount,
                  percentage: split.percentage || undefined,
                }))}
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpense.isPending || updateExpense.isPending || splits.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createExpense.isPending || updateExpense.isPending
                ? 'Saving...'
                : isEditing
                ? 'Update Expense'
                : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
