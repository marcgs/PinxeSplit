import { useState, useEffect, useMemo } from 'react';
import { useSplitCalculator, type SplitType, type Split } from '../hooks/useSplitCalculator';
import { fromCents } from '@pinxesplit/shared';
import { EqualSplit } from './EqualSplit';
import { AmountSplit } from './AmountSplit';
import { PercentageSplit } from './PercentageSplit';
import { SharesSplit } from './SharesSplit';

interface SplitCalculatorProps {
  members: Array<{ userId: string; name: string }>;
  defaultPayerId: string;
  amount: number; // In minor units (cents)
  currency: string;
  scale?: number;
  onSplitsChange: (splits: Split[]) => void;
  initialSplits?: Split[]; // eslint-disable-line @typescript-eslint/no-unused-vars
}

export function SplitCalculator({
  members,
  defaultPayerId,
  amount,
  currency,
  scale = 100,
  onSplitsChange,
}: SplitCalculatorProps) {
  const calculator = useSplitCalculator(members, defaultPayerId, amount, currency, scale);
  const [activeTab, setActiveTab] = useState<SplitType>('equal');

  const handleTabChange = (type: SplitType) => {
    setActiveTab(type);
    calculator.setSplitType(type);
  };

  // Calculate splits whenever state changes
  const calculatedSplits = useMemo(() => {
    try {
      return calculator.calculateSplits();
    } catch (error) {
      return [];
    }
  }, [calculator.state]);

  // Check validity without side effects
  const isValidSplit = useMemo(() => {
    try {
      return calculator.isValid();
    } catch (error) {
      return false;
    }
  }, [calculator.state]);

  // Propagate splits changes
  useEffect(() => {
    onSplitsChange(calculatedSplits);
  }, [calculatedSplits, onSplitsChange]);

  const handleSplitUpdate = () => {
    // Trigger recalculation via state changes in calculator
  };

  const tabs: Array<{ id: SplitType; label: string }> = [
    { id: 'equal', label: 'Equal' },
    { id: 'amount', label: 'Amount' },
    { id: 'percentage', label: 'Percentage' },
    { id: 'shares', label: 'Shares' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Payer Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paid by
        </label>
        <select
          value={calculator.state.payerId}
          onChange={(e) => {
            calculator.setPayerId(e.target.value);
            handleSplitUpdate();
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {/* Split Type Content */}
      <div className="mt-4">
        {activeTab === 'equal' && (
          <EqualSplit
            participants={calculator.state.participants}
            totalAmount={amount}
            currency={currency}
            scale={scale}
            payerId={calculator.state.payerId}
            onToggleParticipant={calculator.toggleParticipant}
            onUpdate={handleSplitUpdate}
          />
        )}

        {activeTab === 'amount' && (
          <AmountSplit
            participants={calculator.state.participants}
            totalAmount={amount}
            currency={currency}
            scale={scale}
            onToggleParticipant={calculator.toggleParticipant}
            onUpdateAmount={calculator.updateParticipantAmount}
            onUpdate={handleSplitUpdate}
          />
        )}

        {activeTab === 'percentage' && (
          <PercentageSplit
            participants={calculator.state.participants}
            totalAmount={amount}
            currency={currency}
            scale={scale}
            payerId={calculator.state.payerId}
            onToggleParticipant={calculator.toggleParticipant}
            onUpdatePercentage={calculator.updateParticipantPercentage}
            onUpdate={handleSplitUpdate}
          />
        )}

        {activeTab === 'shares' && (
          <SharesSplit
            participants={calculator.state.participants}
            totalAmount={amount}
            currency={currency}
            scale={scale}
            payerId={calculator.state.payerId}
            onToggleParticipant={calculator.toggleParticipant}
            onUpdateShares={calculator.updateParticipantShares}
            onUpdate={handleSplitUpdate}
          />
        )}
      </div>

      {/* Validation Error */}
      {calculator.validationError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {calculator.validationError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {isValidSplit && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Split Preview</h4>
          <div className="space-y-2">
            {calculatedSplits.map((split) => {
              const participant = calculator.state.participants.find(
                (p) => p.userId === split.userId
              );
              return (
                <div key={split.userId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{participant?.name}</span>
                  <span className="font-medium">
                    {currency} {fromCents(split.owedShare, scale).toFixed(scale === 1 ? 0 : scale === 1000 ? 3 : 2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
