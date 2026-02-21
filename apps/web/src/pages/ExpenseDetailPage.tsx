import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useExpense, useDeleteExpense } from '../hooks/useExpenses';
import { fromCents } from '@pinxesplit/shared';
import { PageContainer } from '../components/PageContainer';
import { getCurrencyScale } from '../utils/currency';

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: expense, isLoading, error } = useExpense(id);
  const deleteExpense = useDeleteExpense();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteExpense.mutateAsync(id);
      navigate(`/groups/${expense?.groupId}`);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (error || !expense) {
    return (
      <PageContainer>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            Failed to load expense. Please try again.
          </p>
        </div>
      </PageContainer>
    );
  }

  const scale = getCurrencyScale(expense.currency);
  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
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
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/expenses/${id}/edit`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Expense Details Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            {/* Category */}
            {expense.category && (
              <div className="flex items-center space-x-2 mb-4">
                {expense.category.icon && (
                  <span className="text-2xl">{expense.category.icon}</span>
                )}
                <span className="text-sm text-gray-600">{expense.category.name}</span>
              </div>
            )}

            {/* Description */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {expense.description}
            </h1>

            {/* Amount */}
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {expense.currency} {fromCents(expense.amount, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
            </p>

            {/* Date */}
            <p className="text-sm text-gray-600 mb-4">{formattedDate}</p>

            {/* Paid by */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Paid by</p>
              <p className="text-lg font-medium text-gray-900">
                {expense.paidBy.name}
              </p>
            </div>

            {/* Group */}
            {expense.group && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Group</p>
                <button
                  onClick={() => navigate(`/groups/${expense.groupId}`)}
                  className="text-lg font-medium text-blue-600 hover:text-blue-700"
                >
                  {expense.group.name}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Splits Breakdown */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Split Breakdown
            </h2>
            <div className="space-y-3">
              {expense.splits.map((split) => (
                <div
                  key={split.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {split.user.avatar ? (
                        <img
                          src={split.user.avatar}
                          alt={split.user.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {split.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {split.user.name}
                      </p>
                      {split.percentage !== null && (
                        <p className="text-xs text-gray-500">
                          {split.percentage}% of total
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {expense.currency} {fromCents(split.amount, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteDialog(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Expense
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this expense? This action cannot
                        be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteExpense.isPending}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {deleteExpense.isPending ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
