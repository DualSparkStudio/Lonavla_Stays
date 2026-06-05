import React from 'react';
import { formatTime24, parseTime24, type Time12Parts } from '../../data/resort';

type AdminTime12InputProps = {
  value: string;
  onChange: (value24: string) => void;
  fallback: Time12Parts;
};

const fieldClass =
  'w-11 border-0 bg-transparent text-center text-base font-semibold text-gray-900 focus:outline-none focus:ring-0 p-0';

const AdminTime12Input: React.FC<AdminTime12InputProps> = ({ value, onChange, fallback }) => {
  const parts = parseTime24(value, fallback);

  const update = (patch: Partial<Time12Parts>) => {
    onChange(formatTime24({ ...parts, ...patch }));
  };

  const clampHour = (raw: string) => {
    const n = Number(raw.replace(/\D/g, ''));
    if (!raw || Number.isNaN(n)) return parts.hour;
    return Math.min(12, Math.max(1, Math.round(n)));
  };

  const clampMinute = (raw: string) => {
    const n = Number(raw.replace(/\D/g, ''));
    if (!raw || Number.isNaN(n)) return parts.minute;
    return Math.min(59, Math.max(0, Math.round(n)));
  };

  const periodBtn = (period: 'AM' | 'PM') =>
    `min-w-[3.25rem] px-4 py-2.5 text-sm font-semibold transition-colors ${
      parts.period === period ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="flex items-stretch w-full max-w-xs rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
      <div className="flex flex-1 items-center justify-center gap-1 px-3 py-2 min-w-0">
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={parts.hour}
          onChange={(e) => update({ hour: clampHour(e.target.value) })}
          className={fieldClass}
          aria-label="Hour"
        />
        <span className="text-gray-400 font-bold text-lg leading-none select-none">:</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={String(parts.minute).padStart(2, '0')}
          onChange={(e) => update({ minute: clampMinute(e.target.value) })}
          onBlur={() => update({ minute: parts.minute })}
          className={fieldClass}
          aria-label="Minute"
        />
      </div>
      <div className="flex border-l border-gray-200 shrink-0" role="group" aria-label="AM or PM">
        <button type="button" className={periodBtn('AM')} onClick={() => update({ period: 'AM' })}>
          AM
        </button>
        <button type="button" className={periodBtn('PM')} onClick={() => update({ period: 'PM' })}>
          PM
        </button>
      </div>
    </div>
  );
};

export default AdminTime12Input;
