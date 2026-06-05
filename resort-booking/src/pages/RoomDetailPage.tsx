import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import StickyBookingPanel from '../components/StickyBookingPanel';
import { ChevronLeftIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import Button from '../components/ui/Button';
import LocationMapSection from '../components/maps/LocationMapSection';
import { formatPrice, formatTimeLabel } from '../data/resort';
import { useSiteData } from '../context/SiteDataContext';

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const { getRoomById, settings } = useSiteData();

  const room = id ? getRoomById(id) : undefined;

  if (!room) {
    return (
      <PublicLayout currentPage="villas">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-3xl text-gray-900 mb-4">Villa not found</h1>
          <Link to="/villas" className="text-airbnb-red font-bold hover:underline">
            ← Back to all villas
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const nextImage = () => setImageIndex((i) => (i + 1) % room.images.length);
  const prevImage = () => setImageIndex((i) => (i - 1 + room.images.length) % room.images.length);

  return (
    <PublicLayout currentPage="villas">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 py-8">
        <button
          type="button"
          onClick={() => navigate('/villas')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-airbnb-red font-bold mb-6 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          All villas
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
          <div className="flex-1 min-w-0 space-y-6">
            <AnimatedSection variant="fade-in">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={room.images[imageIndex]}
                  alt={room.name}
                  className="w-full h-80 md:h-[28rem] object-cover"
                />
                {room.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:scale-105 transition-transform"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:scale-105 transition-transform"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {room.images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === imageIndex ? 'border-airbnb-red' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="h-16 w-24 object-cover" />
                  </button>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-800 mb-3">
                {room.room_type}
              </span>
              <h1 className="font-heading text-4xl text-gray-900 mb-2">{room.name}</h1>
              <p className="flex items-start gap-2 text-lg text-gray-600 mb-2">
                <MapPinIcon className="h-5 w-5 shrink-0 mt-0.5 text-airbnb-red" />
                <span>
                  {room.location}
                  <span className="block text-base text-gray-500 mt-1">{room.address}</span>
                </span>
              </p>
              <p className="text-base text-gray-500 mb-2">
                Managed by {settings.resortName} · ★ {room.rating} ({room.review_count} reviews)
              </p>
              <p className="text-base text-gray-600 mb-4">
                Check-in {formatTimeLabel(settings.checkInTime)} · Check-out {formatTimeLabel(settings.checkOutTime)}
              </p>
              <p className="text-base text-gray-600 leading-relaxed">{room.description}</p>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <h2 className="font-heading text-2xl text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm font-medium text-gray-700"
                  >
                    <span className="text-airbnb-red">✓</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <LocationMapSection
                mapEmbedUrl={room.mapEmbedUrl}
                address={room.address}
                location={room.location}
              />
            </AnimatedSection>
          </div>

          <aside className="w-full lg:w-[380px] lg:shrink-0">
            <StickyBookingPanel className="bg-white rounded-2xl border border-gray-200 shadow-lg px-4 py-5 sm:px-5">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatPrice(room.price_per_night)}
                <span className="text-base font-medium text-gray-600"> / night</span>
              </p>
              <p className="flex items-center gap-2 text-base text-gray-600 font-medium mb-2">
                <UserGroupIcon className="h-5 w-5" />
                Up to {room.max_guests} guests
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Check-in {formatTimeLabel(settings.checkInTime)} · Check-out {formatTimeLabel(settings.checkOutTime)}
              </p>
              <AvailabilityCalendar
                embedded
                roomId={room.id}
                selectedStartDate={checkIn || undefined}
                selectedEndDate={checkOut && checkOut > checkIn ? checkOut : undefined}
                onDateSelect={(start, end) => {
                  setCheckIn(start);
                  setCheckOut(end);
                }}
              />
              <Button
                fullWidth
                size="lg"
                className="rounded-full btn-primary-motion mb-3 mt-4"
                disabled={!checkIn || !checkOut || checkOut <= checkIn}
                onClick={() => {
                  const params = new URLSearchParams({ checkIn, checkOut });
                  navigate(`/booking/${room.id}?${params.toString()}`);
                }}
              >
                Reserve this villa
              </Button>
              <Link to="/contact">
                <Button variant="outline" fullWidth size="lg" className="rounded-full">
                  Ask a question
                </Button>
              </Link>
            </StickyBookingPanel>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
};

export default RoomDetailPage;
