import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (email: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AddMemberDialog({ isOpen, onClose, onAddMember, isLoading, error }: AddMemberDialogProps) {
  const [email, setEmail] = useState('');

  // Clear email when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onAddMember(email.trim());
    }
  };

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-title"
        className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="add-member-title" className="text-xl font-semibold">Add Member</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 hover:bg-accent"
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
