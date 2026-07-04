import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { villaIdsMatch } from '../../lib/bookingPricing';
import type { CustomDatePrice } from '../../types/site';

type Props = {
  rules: CustomDatePrice[];
  onChange: (rules: CustomDatePrice[]) => void;
  /** When set, rules apply to this villa only (no villa picker). */
  roomId: string;
};

const newRule = (roomId: string): CustomDatePrice => ({
  id: `cdp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  roomId,
  startDate: '',
  endDate: '',
  pricePerNight: 0,
  label: '',
});

const AdminCustomDatePricing: React.FC<Props> = ({ rules, onChange, roomId }) => {
  const updateRule = (id: string, patch: Partial<CustomDatePrice>) => {
    onChange(rules.map((rule) => (rule.id === id ? { ...rule, ...patch, roomId } : rule)));
  };

  const removeRule = (id: string) => {
    onChange(rules.filter((rule) => rule.id !== id));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Override weekday and weekend rates for holidays or peak dates on this villa only.
      </p>

      {rules.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No custom date prices for this villa.</p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={rule.startDate}
                  onChange={(e) => updateRule(rule.id, { startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={rule.endDate}
                  onChange={(e) => updateRule(rule.id, { endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Price / night (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={rule.pricePerNight || ''}
                  onChange={(e) =>
                    updateRule(rule.id, { pricePerNight: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Label (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Diwali"
                  value={rule.label ?? ''}
                  onChange={(e) => updateRule(rule.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label="Remove rule"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange([...rules, newRule(roomId)])}
        className="text-sm font-semibold text-red-600 hover:text-red-700"
      >
        + Add custom date price
      </button>
    </div>
  );
};

export default AdminCustomDatePricing;

export function customPricesForVilla(all: CustomDatePrice[], villaId: string): CustomDatePrice[] {
  return all.filter((rule) => villaIdsMatch(rule.roomId, villaId));
}

export function mergeVillaCustomPrices(
  all: CustomDatePrice[],
  villaId: string,
  villaRules: CustomDatePrice[],
): CustomDatePrice[] {
  const others = all.filter((rule) => !villaIdsMatch(rule.roomId, villaId));
  const stamped = villaRules.map((rule) => ({ ...rule, roomId: villaId }));
  return [...others, ...stamped];
}
