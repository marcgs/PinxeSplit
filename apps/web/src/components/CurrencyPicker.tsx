import { useState, useMemo } from 'react';
import { useCurrencies } from '../hooks/useCurrencies';
import { cn } from '../lib/utils';

interface CurrencyPickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Searchable currency picker dropdown component
 * Allows users to search and select currencies by code or name
 */
export function CurrencyPicker({
  value,
  onValueChange,
  className,
  placeholder = 'Select currency...',
}: CurrencyPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: currencies, isLoading, error } = useCurrencies();

  // Filter currencies by search term (code or name)
  const filteredCurrencies = useMemo(() => {
    if (!currencies) return [];
    if (!search) return currencies;

    const lowerSearch = search.toLowerCase();
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(lowerSearch) ||
        currency.name.toLowerCase().includes(lowerSearch)
    );
  }, [currencies, search]);

  const selectedCurrency = currencies?.find((c) => c.code === value);

  const handleSelect = (currencyCode: string) => {
    onValueChange?.(currencyCode);
    setOpen(false);
    setSearch('');
  };

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Failed to load currencies
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
          isLoading && 'cursor-wait opacity-50'
        )}
        disabled={isLoading}
      >
        {selectedCurrency ? (
          <span className="flex items-center gap-2">
            <span className="font-medium">{selectedCurrency.symbol}</span>
            <span className="font-medium">{selectedCurrency.code}</span>
            <span className="text-gray-500">— {selectedCurrency.name}</span>
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <svg
          className={cn(
            'h-4 w-4 transition-transform',
            open && 'rotate-180'
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search currencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="py-1">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleSelect(currency.code)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100',
                    value === currency.code && 'bg-blue-50 text-blue-700'
                  )}
                >
                  <span className="font-medium">{currency.symbol}</span>
                  <span className="font-medium">{currency.code}</span>
                  <span className="text-gray-500">— {currency.name}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No currencies found
              </div>
            )}
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpen(false);
            setSearch('');
          }}
        />
      )}
    </div>
  );
}
