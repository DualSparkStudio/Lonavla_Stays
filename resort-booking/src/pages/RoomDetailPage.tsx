import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  ArrowUpOnSquareIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  HeartIcon,
  HomeModernIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import PublicLayout from '../components/layout/PublicLayout';
import VillaDetailBookingCard from '../components/villas/VillaDetailBookingCard';
import VillaDetailMobileBar from '../components/villas/VillaDetailMobileBar';
import VillaPhotoGallery from '../components/villas/VillaPhotoGallery';
import VillaAvailabilityModal from '../components/villas/VillaAvailabilityModal';
import PolicySections from '../components/PolicySections';
import { checkInLabelFromTime, checkOutLabelFromTime } from '../data/resort';
import { resolveGoogleMapsOpenUrl, resolveMapsDisplay } from '../lib/googleMaps';
import { normalizeImageUrls } from '../lib/imageUrl';
import {
  computeStayPricing,
  getVillaCardPriceDisplay,
  resolveVillaCardRateMode,
} from '../lib/bookingPricing';
import {
  hasPrivatePool,
  parseBathroomsFromAmenities,
  parseBedroomsFromRoomType,
  ratingDistribution,
  truncateText,
} from '../lib/villaDetailHelpers';
import { useSiteData } from '../context/SiteDataContext';

const AMENITY_PREVIEW_COUNT = 9;

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestInput, setGuestInput] = useState('2');
  const [saved, setSaved] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { getRoomById, settings } = useSiteData();

  useEffect(() => {
    const fromCheckIn = searchParams.get('checkIn') ?? '';
    const fromCheckOut = searchParams.get('checkOut') ?? '';
    const fromGuests = searchParams.get('guests');
    if (fromCheckIn && fromCheckOut && fromCheckOut > fromCheckIn) {
      setCheckIn(fromCheckIn);
      setCheckOut(fromCheckOut);
    }
    if (fromGuests && Number(fromGuests) > 0) {
      setGuestInput(String(Math.floor(Number(fromGuests))));
    }
  }, [searchParams]);

  const room = id ? getRoomById(id) : undefined;

  const galleryImages = useMemo(
    () => (room ? normalizeImageUrls(room.images) : []),
    [room],
  );

  const stayRateMode = useMemo(
    () => resolveVillaCardRateMode(checkIn, checkOut, settings.pricingHolidays),
    [checkIn, checkOut, settings.pricingHolidays],
  );

  const cardPriceDisplay = useMemo(() => {
    if (!room) return getVillaCardPriceDisplay(0, undefined, 'none');
    return getVillaCardPriceDisplay(
      room.price_per_night,
      room.weekend_price_per_night,
      stayRateMode,
    );
  }, [room, stayRateMode]);

  const guestCount = useMemo(() => {
    const parsed = Number(guestInput);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.floor(parsed);
  }, [guestInput]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
    return Math.max(
      0,
      Math.round(
        (new Date(`${checkOut}T12:00:00`).getTime() - new Date(`${checkIn}T12:00:00`).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
  }, [checkIn, checkOut]);

  const pricing = useMemo(() => {
    if (!room) {
      return computeStayPricing({
        pricePerNight: 0,
        nights: 0,
        guestCount: 1,
        guestsIncluded: 1,
        extraPersonCharge: 0,
      });
    }
    return computeStayPricing({
      pricePerNight: room.price_per_night,
      weekendPricePerNight: room.weekend_price_per_night,
      checkInDate: checkIn,
      pricingHolidays: settings.pricingHolidays,
      nights,
      guestCount,
      guestsIncluded: room.max_guests,
      extraPersonCharge: settings.extraPersonCharge ?? 1500,
    });
  }, [room, checkIn, nights, guestCount, settings.pricingHolidays, settings.extraPersonCharge, checkOut]);

  const canBook = nights >= 1 && checkOut > checkIn;

  const navigateToBooking = useCallback(() => {
    if (!room || !canBook) return;
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guestCount) });
    navigate(`/booking/${room.id}?${params.toString()}`);
  }, [room, canBook, checkIn, checkOut, guestCount, navigate]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: room?.name, url });
        return;
      }
    } catch {
      /* user cancelled */
    }
    await navigator.clipboard.writeText(url);
  };

  if (!room) {
    return (
      <PublicLayout currentPage="villas">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-3xl mb-4">Villa not found</h1>
          <Link to="/villas" className="text-airbnb-red font-bold hover:underline">
            ← Back to all villas
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const checkInLabel = checkInLabelFromTime(settings.checkInTime);
  const checkOutLabel = checkOutLabelFromTime(settings.checkOutTime);
  const bedrooms = parseBedroomsFromRoomType(room.room_type);
  const bathrooms = parseBathroomsFromAmenities(room.amenities);
  const pool = hasPrivatePool(room.amenities);
  const { preview: descriptionPreview, isTruncated: descriptionTruncated } = truncateText(
    room.description,
    320,
  );
  const visibleAmenities = showAllAmenities
    ? room.amenities
    : room.amenities.slice(0, AMENITY_PREVIEW_COUNT);
  const starBars = ratingDistribution(room.rating, room.review_count);
  const { embedUrl } = resolveMapsDisplay(room.mapEmbedUrl, room.address, room.location, room.mapsLink);
  const mapsUrl = resolveGoogleMapsOpenUrl(room.mapEmbedUrl, room.address, room.location, room.mapsLink);

  const pageTitle = `${room.name} – ${room.room_type}`;

  return (
    <PublicLayout currentPage="villas">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold leading-tight text-gray-900">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold underline hover:bg-gray-50"
            >
              <ArrowUpOnSquareIcon className="h-4 w-4" />
              Share
            </button>
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold underline hover:bg-gray-50"
            >
              {saved ? (
                <HeartSolid className="h-4 w-4 text-airbnb-red" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        </div>

        <div className="mb-6">
          <VillaPhotoGallery images={galleryImages} originals={room.images} alt={room.name} />
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base text-gray-900 mb-6">
          <span className="inline-flex items-center gap-1 font-semibold">
            <StarSolid className="h-4 w-4" />
            {room.rating}
          </span>
          <span>·</span>
          <button type="button" className="font-semibold underline">
            {room.review_count} reviews
          </button>
          <span>·</span>
          <span className="font-semibold">Superhost</span>
          <span>·</span>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold underline"
          >
            <MapPinIcon className="h-4 w-4" />
            {room.location}, Maharashtra, India
          </a>
        </div>

        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base text-gray-900 pb-6 mb-6 border-b border-gray-200">
          <span className="inline-flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            {room.max_guests} guests
          </span>
          {bedrooms != null && (
            <span className="inline-flex items-center gap-2">
              <HomeModernIcon className="h-5 w-5" />
              {bedrooms} bedroom{bedrooms !== 1 ? 's' : ''}
            </span>
          )}
          {bathrooms != null && (
            <span className="inline-flex items-center gap-2">
              <span className="text-lg leading-none">🛁</span>
              {bathrooms} bathroom{bathrooms !== 1 ? 's' : ''}
            </span>
          )}
          {pool && (
            <span className="inline-flex items-center gap-2">
              <span className="text-lg leading-none">🏊</span>
              Private pool
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">
          <div className="flex-1 min-w-0 space-y-10">
            <section className="pb-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About this space</h2>
              <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">
                {showFullDescription ? room.description : descriptionPreview}
              </p>
              {descriptionTruncated && !showFullDescription && (
                <button
                  type="button"
                  onClick={() => setShowFullDescription(true)}
                  className="mt-3 text-sm font-semibold underline text-gray-900"
                >
                  Show more
                </button>
              )}
            </section>

            <section className="pb-8 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-5">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                {visibleAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-base text-gray-800">
                    <WifiIcon className="h-6 w-6 shrink-0 text-gray-700" aria-hidden />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              {room.amenities.length > AMENITY_PREVIEW_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAllAmenities((v) => !v)}
                  className="mt-5 rounded-lg border border-gray-900 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  {showAllAmenities
                    ? 'Show fewer amenities'
                    : `Show all ${room.amenities.length} amenities`}
                </button>
              )}
            </section>

            {embedUrl && (
              <section className="pb-8 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Where you&apos;ll be</h2>
                <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                  <iframe
                    title={`Map — ${room.location}`}
                    src={embedUrl}
                    className="w-full h-72 border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 left-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow border border-gray-200 hover:bg-gray-50"
                  >
                    Show on map
                  </a>
                </div>
                <p className="mt-3 text-base text-gray-800">{room.address || room.location}</p>
              </section>
            )}

            <section>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <StarSolid className="h-8 w-8 text-gray-900" />
                <span className="text-3xl font-bold text-gray-900">{room.rating}</span>
                <span className="text-xl text-gray-700">· {room.review_count} reviews</span>
              </div>
              <div className="grid sm:grid-cols-[1fr_1.2fr] gap-8">
                <div className="space-y-2">
                  {starBars.map((bar) => (
                    <div key={bar.stars} className="flex items-center gap-3 text-sm">
                      <span className="w-3 font-medium">{bar.stars}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: `${bar.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-base text-gray-700 leading-relaxed">
                  Guests love the spacious layout, private pool, and smooth check-in experience at{' '}
                  {room.name}. Reviews reflect stays managed by {settings.resortName} across Lonavala.
                </div>
              </div>
            </section>
          </div>

          <aside className="w-full lg:w-[400px] lg:shrink-0">
            <VillaDetailBookingCard
              room={room}
              checkIn={checkIn}
              checkOut={checkOut}
              guestInput={guestInput}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
              onGuestChange={setGuestInput}
              onBook={navigateToBooking}
              priceDisplay={cardPriceDisplay}
              extraPersonCharge={settings.extraPersonCharge ?? 1500}
              pricingHolidays={settings.pricingHolidays}
              onToggleCalendar={() => setShowCalendar(true)}
            />

            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <ArrowPathIcon className="h-5 w-5 shrink-0" />
                Free cancellation
              </li>
              <li className="flex items-center gap-2">
                <CheckBadgeIcon className="h-5 w-5 shrink-0" />
                40% advance required
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 shrink-0" />
                Secure &amp; safe payments
              </li>
              <li className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 shrink-0" />
                24×7 Host support
              </li>
            </ul>

            {settings.houseRulesSections.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">House rules</h3>
                <PolicySections
                  sections={settings.houseRulesSections.slice(0, 1)}
                  checkInTime={settings.checkInTime}
                  checkOutTime={settings.checkOutTime}
                />
                <p className="text-sm text-gray-700">
                  Check-in {checkInLabel} · Check-out {checkOutLabel}
                </p>
                <Link to="/house-rules" className="text-sm font-semibold underline text-gray-900">
                  Show all house rules
                </Link>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cancellation policy</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Free cancellation up to 24 hours before check-in. After that, modifications are subject
                to availability. Contact {settings.resortName} for assistance.
              </p>
              <Link to="/terms-and-conditions" className="mt-2 inline-block text-sm font-semibold underline text-gray-900">
                Learn more
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Hosted by</p>
              <p className="font-semibold text-gray-900">{settings.resortName}</p>
              <p className="text-sm text-gray-600 mt-1">Curated villas across Lonavala · Responds within an hour</p>
              <Link to="/contact" className="mt-3 inline-block text-sm font-semibold underline text-gray-900">
                Contact host
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <VillaAvailabilityModal
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
        title="Select dates"
      >
        <AvailabilityCalendar
          embedded
          roomId={room.id}
          selectedStartDate={checkIn || undefined}
          selectedEndDate={checkOut && checkOut > checkIn ? checkOut : undefined}
          onDateSelect={(start, end) => {
            setCheckIn(start);
            setCheckOut(end);
            if (end && end > start) setShowCalendar(false);
          }}
        />
      </VillaAvailabilityModal>

      <VillaDetailMobileBar
        priceDisplay={cardPriceDisplay}
        rating={room.rating}
        total={pricing.total}
        canBook={canBook}
        onBook={navigateToBooking}
        onContact={() => navigate('/contact')}
      />
    </PublicLayout>
  );
};

export default RoomDetailPage;
