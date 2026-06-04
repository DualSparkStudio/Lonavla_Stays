import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import { useSiteData } from '../context/SiteDataContext';
import { formatPrice } from '../data/resort';
import { getPrimaryImage } from '../lib/imageUrl';

const RoomsPage: React.FC = () => {
  const { rooms, settings } = useSiteData();
  const [searchParams] = useSearchParams();
  const [typeFilter, setTypeFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');

  useEffect(() => {
    const area = searchParams.get('area');
    if (area) setAreaFilter(area);
  }, [searchParams]);

  const searchHint = useMemo(() => {
    const parts: string[] = [];
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    if (checkIn && checkOut) parts.push(`${checkIn} → ${checkOut}`);
    if (guests) parts.push(`${guests} guest${guests !== '1' ? 's' : ''}`);
    return parts.length ? parts.join(' · ') : null;
  }, [searchParams]);

  const roomTypes = ['all', ...Array.from(new Set(rooms.map((r) => r.room_type)))];
  const areas = ['all', ...Array.from(new Set(rooms.map((r) => r.location)))];

  const roomsList = useMemo(() => {
    let list = rooms.filter((r) => r.status === 'available');
    if (typeFilter !== 'all') {
      list = list.filter((r) => r.room_type === typeFilter);
    }
    if (areaFilter !== 'all') {
      list = list.filter((r) => r.location === areaFilter);
    }
    const guestCount = Number(searchParams.get('guests'));
    if (guestCount > 0) {
      list = list.filter((r) => r.max_guests >= guestCount);
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_per_night - b.price_per_night;
      if (sortBy === 'price-desc') return b.price_per_night - a.price_per_night;
      return b.rating - a.rating;
    });
  }, [typeFilter, areaFilter, sortBy, searchParams, rooms]);

  return (
    <PublicLayout currentPage="villas">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <AnimatedSection>
            <h1 className="font-heading text-4xl md:text-5xl text-gray-900 mb-3">{settings.villasPageTitle}</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              {settings.villasPageSubtitle}
            </p>
            {searchHint && (
              <p className="mt-3 text-base font-medium text-airbnb-red">
                Showing stays for: {searchHint}
                {areaFilter !== 'all' ? ` · ${areaFilter}` : ''}
              </p>
            )}
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {roomTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  typeFilter === type
                    ? 'bg-airbnb-red text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-airbnb-red hover:text-airbnb-red'
                }`}
              >
                {type === 'all' ? 'All villas' : type}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-base font-medium bg-white focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
            >
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area === 'all' ? 'All areas' : area}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-base font-medium bg-white focus:outline-none focus:ring-2 focus:ring-airbnb-red/30"
            >
              <option value="rating">Top rated</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {roomsList.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-lg font-medium mb-4">No villas match your search.</p>
            <Link to="/villas" className="text-airbnb-red font-bold hover:underline">
              View all villas →
            </Link>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {roomsList.map((room, index) => (
            <AnimatedSection key={room.id} delay={index * 100}>
              <Link
                to={`/villas/${room.id}`}
                className="room-card block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-md h-full"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getPrimaryImage(room.images, 'https://via.placeholder.com/800x600?text=Villa')}
                    alt={room.name}
                    className="room-card-image w-full h-72 object-cover"
                  />
                  <span className="villa-card-tag absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold">
                    {room.room_type}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h2 className="font-heading text-xl text-gray-900 uppercase tracking-wide">{room.name}</h2>
                    <span className="text-base font-bold text-gray-800">★ {room.rating}</span>
                  </div>
                  <p className="text-base text-gray-600 font-medium mb-2">
                    {room.location} · Up to {room.max_guests} guests
                  </p>
                  <p className="text-base text-gray-500 mb-4 line-clamp-2">{room.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.slice(0, 4).map((a) => (
                      <span key={a} className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">
                      <span className="villa-card-price">{formatPrice(room.price_per_night)}</span>
                      <span className="text-base font-medium text-gray-600"> / night</span>
                    </span>
                    <span className="text-airbnb-red font-bold text-sm">View details →</span>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default RoomsPage;
