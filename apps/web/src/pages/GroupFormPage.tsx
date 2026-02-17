import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';
import { useCreateGroup, useUpdateGroup, useGroup } from '@/hooks/useGroups';
import { CURRENCY_CODES } from '@pinxesplit/shared';

export function GroupFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');

  const { data: group, isLoading: isLoadingGroup } = useGroup(id);
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup(id || '');

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setCurrency(group.currency);
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          name,
          description: description || undefined,
          currency,
        });
      } else {
        await createMutation.mutateAsync({
          name,
          description: description || undefined,
          currency,
        });
      }
      navigate('/groups');
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const mutation = isEditing ? updateMutation : createMutation;
  const error = mutation.error as Error | null;

  if (isEditing && isLoadingGroup) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/groups')}
            className="rounded-md p-2 hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Group' : 'Create Group'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Group Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Trip to Paris"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-2">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {/* Major currencies first */}
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="MXN">MXN - Mexican Peso</option>
              {/* Divider */}
              <option disabled>─────────────</option>
              {/* All other currencies */}
              {CURRENCY_CODES.filter(code => !['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'INR', 'MXN'].includes(code)).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error.message || 'An error occurred. Please try again.'}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
