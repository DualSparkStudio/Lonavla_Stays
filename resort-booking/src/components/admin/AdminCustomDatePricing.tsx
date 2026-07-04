import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { CustomDatePrice } from '../../types/site';
import type { Room } from '../../data/resort';

type Props = {
  rules: CustomDatePrice[];
  rooms: Room[];
  onChange: (rules: CustomDatePrice[]) => void;
};

const newRule = (): CustomDatePrice => ({
  id: `cdp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  roomId: '',
  startDate: '',
  endDate: '',
  pricePerNight: 0,
  label: '',
});

const AdminCustomDatePricing: React.FC<Props> = ({ rules, rooms, onChange }) => {
  const updateRule = (id: string, patch: Partial<CustomDatePrice>) => {
    onChange(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  };

  const removeRule = (id: string) => {
    onChange(rules.filter((rule) => rule.id !== id));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Set a custom nightly rate for holidays, long weekends, or peak dates. These override weekday
        and weekend rates for the selected nights. Leave villa as &quot;All villas&quot; to apply
        site-wide, or pick one villa for a property-specific rate.
      </p>

      {rules.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No custom date prices yet.</p>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Villa</label>
                <select
                  value={rule.roomId}
                  onChange={(e) => updateRule(rule.id, { roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All villas</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
                <input
                  type="date"
                  value={rule.startDate}
                  onChange={(e) => updateRule(rule.id, { startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
                <input
                  type="date"
                  value={rule.endDate}
                  onChange={(e) => updateRule(rule.id, { endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-2">
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
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Label (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Diwali"
                  value={rule.label ?? ''}
                  onChange={(e) => updateRule(rule.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
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
        onClick={() => onChange([...rules, newRule()])}
        className="text-sm font-semibold text-red-600 hover:text-red-700"
      >
        + Add custom date price
      </button>
    </div>
  );
};

export default AdminCustomDatePricing;
