import React, { useState } from 'react';
import { MagnifyingGlassIcon, CalendarDaysIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Button from './Button';
import { cn } from '../../utils/cn';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  className?: string;
  compact?: boolean;
}

interface SearchFilters {
  checkIn?: Date;
  checkOut?: Date;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  className,
  compact = false
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    guests: { adults: 2, children: 0, infants: 0 }
  });
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleGuestChange = (type: keyof SearchFilters['guests'], value: number) => {
    setFilters(prev => ({
      ...prev,
      guests: {
        ...prev.guests,
        [type]: Math.max(0, value)
      }
    }));
  };

  const getTotalGuests = () => {
    return filters.guests.adults + filters.guests.children;
  };

  const getGuestText = () => {
    const total = getTotalGuests();
    const { infants } = filters.guests;
    
    if (total === 0 && infants === 0) return 'Add guests';
    
    let text = `${total} guest${total !== 1 ? 's' : ''}`;
    if (infants > 0) {
      text += `, ${infants} infant${infants !== 1 ? 's' : ''}`;
    }
    return text;
  };

  if (compact) {
    return (
      <div className={cn('bg-white rounded-full shadow-md border border-gray-200 p-2', className)}>
        <div className="flex items-center space-x-2">
          <div className="flex-1 px-4 py-2">
            <input
              type="text"
              placeholder="Search destinations"
              className="w-full text-base placeholder-gray-500 focus:outline-none"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="rounded-full p-3"
            size="sm"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-2xl md:rounded-full shadow-lg border border-gray-200', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:divide-x md:divide-gray-300">
        {/* Check-in */}
        <div className="flex-1 min-w-0">
          <button
            className={cn(
              'w-full px-6 py-4 text-left rounded-l-full hover:bg-gray-50 transition-colors duration-200',
              activeField === 'checkin' && 'bg-gray-50'
            )}
            onClick={() => setActiveField(activeField === 'checkin' ? null : 'checkin')}
          >
            <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Check in
            </div>
            <div className="text-base text-gray-900 mt-1">
              {filters.checkIn ? format(filters.checkIn, 'MMM dd') : 'Add dates'}
            </div>
          </button>
        </div>

        {/* Check-out */}
        <div className="flex-1 min-w-0">
          <button
            className={cn(
              'w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200',
              activeField === 'checkout' && 'bg-gray-50'
            )}
            onClick={() => setActiveField(activeField === 'checkout' ? null : 'checkout')}
          >
            <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Check out
            </div>
            <div className="text-base text-gray-900 mt-1">
              {filters.checkOut ? format(filters.checkOut, 'MMM dd') : 'Add dates'}
            </div>
          </button>
        </div>

        {/* Guests */}
        <div className="flex-1 min-w-0 relative">
          <button
            className={cn(
              'w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200',
              activeField === 'guests' && 'bg-gray-50'
            )}
            onClick={() => setActiveField(activeField === 'guests' ? null : 'guests')}
          >
            <div className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
              Who
            </div>
            <div className="text-base text-gray-900 mt-1">
              {getGuestText()}
            </div>
          </button>

          {/* Guests Dropdown */}
          {activeField === 'guests' && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-floating border border-gray-200 p-6 z-10">
              <div className="space-y-6">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Adults</div>
                    <div className="text-base text-gray-900">Ages 13 or above</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleGuestChange('adults', filters.guests.adults - 1)}
                      disabled={filters.guests.adults <= 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{filters.guests.adults}</span>
                    <button
                      onClick={() => handleGuestChange('adults', filters.guests.adults + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Children</div>
                    <div className="text-base text-gray-900">Ages 2–12</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleGuestChange('children', filters.guests.children - 1)}
                      disabled={filters.guests.children <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{filters.guests.children}</span>
                    <button
                      onClick={() => handleGuestChange('children', filters.guests.children + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Infants</div>
                    <div className="text-base text-gray-900">Under 2</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleGuestChange('infants', filters.guests.infants - 1)}
                      disabled={filters.guests.infants <= 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{filters.guests.infants}</span>
                    <button
                      onClick={() => handleGuestChange('infants', filters.guests.infants + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="flex justify-end p-3 md:pl-4 md:pr-2 md:py-0 md:items-center">
          <Button
            onClick={handleSearch}
            className="rounded-full p-4 w-full md:w-auto"
            size="sm"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 