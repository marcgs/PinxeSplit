import { PageContainer } from '@/components/PageContainer';

export function ExpensesPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Add Expense
          </button>
        </div>
        
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No expenses yet. Add your first expense to a group!
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
