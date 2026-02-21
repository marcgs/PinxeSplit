import { fromCents } from '@pinxesplit/shared';
import { getCurrencyScale } from '../utils/currency';

interface BalanceEntry {
  currency: string;
  amount: number; // positive = owed to user, negative = user owes
}

interface BalanceCardProps {
  name: string;
  email?: string;
  avatar?: string | null;
  balances: BalanceEntry[];
  onClick?: () => void;
}

function formatAmount(amount: number, currency: string): string {
  const scale = getCurrencyScale(currency);
  const abs = fromCents(Math.abs(amount), scale);
  const decimals = scale === 1 ? 0 : scale === 1000 ? 3 : 2;
  return `${currency} ${abs.toFixed(decimals)}`;
}

export function BalanceCard({ name, email, balances, onClick }: BalanceCardProps) {
  const nonZeroBalances = balances.filter((b) => b.amount !== 0);

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border bg-card p-4 ${onClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{name}</p>
          {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
        </div>
        <div className="text-right shrink-0">
          {nonZeroBalances.length === 0 ? (
            <p className="text-sm text-muted-foreground">Settled up</p>
          ) : (
            nonZeroBalances.map((b) => (
              <p
                key={b.currency}
                className={`text-sm font-medium ${b.amount > 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {b.amount > 0 ? '+' : ''}
                {formatAmount(b.amount, b.currency)}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
