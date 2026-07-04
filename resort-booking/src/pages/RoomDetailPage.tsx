import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  ArrowUpOnSquareIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  HomeModernIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
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
  getCancellationPolicyItems,
  getCancellationSection,
  getCancellationSummaryLabel,
} from '../lib/policySections';
import {
  isStayRangeAvailable,
  validateCheckInInput,
  validateCheckOutInput,
} from '../lib/availability';
import {
  hasPrivatePool,
  parseBathroomsFromAmenities,
  parseBedroomsFromRoomType,
  truncateText,
} from '../lib/villaDetailHelpers';
import { clampGuestCount, getVillaFinalCapacity } from '../lib/villaCapacity';
import { useSiteBookings, useSiteData } from '../context/SiteDataContext';

const AMENITY_PREVIEW_COUNT = 9;

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestInput, setGuestInput] = useState('2');
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { getRoomById, settings } = useSiteData();
  const { bookings, blockedDates } = useSiteBookings();

  const room = id ? getRoomById(id) : undefined;

  useEffect(() => {
    const fromCheckIn = searchParams.get('checkIn') ?? '';
    const fromCheckOut = searchParams.get('checkOut') ?? '';
    const fromGuests = searchParams.get('guests');
    if (!room) return;

    if (fromCheckIn && fromCheckOut && fromCheckOut > fromCheckIn) {
      if (isStayRangeAvailable(room.id, fromCheckIn, fromCheckOut, bookings, blockedDates)) {
        setCheckIn(fromCheckIn);
        setCheckOut(fromCheckOut);
      }
    } else if (fromCheckIn) {
      const checkInResult = validateCheckInInput(
        room.id,
        fromCheckIn,
        '',
        bookings,
        blockedDates,
      );
      if (checkInResult.valid) setCheckIn(fromCheckIn);
    }

    if (fromGuests && Number(fromGuests) > 0 && room) {
      setGuestInput(String(clampGuestCount(room, Number(fromGuests))));
    }
  }, [searchParams, room, bookings, blockedDates]);

  useEffect(() => {
    if (!room || (!checkIn && !checkOut)) return;

    if (checkIn) {
      const checkInResult = validateCheckInInput(
        room.id,
        checkIn,
        checkOut,
        bookings,
        blockedDates,
      );
      if (!checkInResult.valid) {
        setCheckIn('');
        setCheckOut('');
        return;
      }
    }

    if (checkIn && checkOut) {
      const checkOutResult = validateCheckOutInput(
        room.id,
        checkIn,
        checkOut,
        bookings,
        blockedDates,
      );
      if (!checkOutResult.valid) setCheckOut('');
    }
  }, [bookings, blockedDates, room, checkIn, checkOut]);

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

  const cancellationSection = useMemo(() => getCancellationSection(settings), [settings]);
  const cancellationItems = useMemo(() => getCancellationPolicyItems(settings), [settings]);
  const cancellationSummary = useMemo(() => getCancellationSummaryLabel(settings), [settings]);

  const guestCount = useMemo(() => {
    if (!room) return 1;
    return clampGuestCount(room, Number(guestInput));
  }, [guestInput, room]);

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
      customDatePrices: settings.customDatePrices,
      roomId: room.id,
      nights,
      guestCount,
      guestsIncluded: room.max_guests,
      extraPersonCharge: settings.extraPersonCharge ?? 1500,
    });
  }, [room, checkIn, nights, guestCount, settings.pricingHolidays, settings.customDatePrices, settings.extraPersonCharge, checkOut]);

  const canBook = useMemo(
    () => isStayRangeAvailable(room?.id ?? '', checkIn, checkOut, bookings, blockedDates),
    [room?.id, checkIn, checkOut, bookings, blockedDates],
  );

  const navigateToBooking = useCallback(() => {
    if (!room || !canBook) return;
    if (!isStayRangeAvailable(room.id, checkIn, checkOut, bookings, blockedDates)) return;
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guestCount) });
    navigate(`/booking/${room.id}?${params.toString()}`);
  }, [room, canBook, checkIn, checkOut, guestCount, navigate, bookings, blockedDates]);

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
  const { embedUrl } = resolveMapsDisplay(room.mapEmbedUrl, room.address, room.location, room.mapsLink);
  const mapsUrl = resolveGoogleMapsOpenUrl(room.mapEmbedUrl, room.address, room.location, room.mapsLink);

  const pageTitle = `${room.name} – ${room.room_type}`;

  const bookingCard = (
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
      customDatePrices={settings.customDatePrices}
      onToggleCalendar={() => setShowCalendar(true)}
    />
  );

  const policySidebar = (
    <>
      <ul className="mt-6 space-y-3 text-base text-gray-700">
        {cancellationSummary ? (
          <li className="flex items-center gap-2">
            <ArrowPathIcon className="h-6 w-6 shrink-0" />
            {cancellationSummary}
          </li>
        ) : null}
        <li className="flex items-center gap-2">
          <CheckBadgeIcon className="h-6 w-6 shrink-0" />
          40% advance required
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheckIcon className="h-6 w-6 shrink-0" />
          Secure &amp; safe payments
        </li>
        <li className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-6 w-6 shrink-0" />
          24×7 Support
        </li>
      </ul>

      {settings.houseRulesSections.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
          <h3 className="text-lg font-bold">House rules</h3>
          <PolicySections
            sections={settings.houseRulesSections.slice(0, 1)}
            checkInTime={settings.checkInTime}
            checkOutTime={settings.checkOutTime}
            itemsClassName="text-lg"
          />
          <p className="text-base text-gray-700">
            Check-in {checkInLabel} · Check-out {checkOutLabel}
          </p>
          <Link to="/house-rules" className="text-sm font-semibold underline text-gray-900">
            Show all house rules
          </Link>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold mb-2">
          {cancellationSection?.title ?? 'Cancellation policy'}
        </h3>
        {cancellationItems.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2 text-base text-gray-700 leading-relaxed">
            {cancellationItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-gray-700 leading-relaxed">
            See our terms for cancellation and rescheduling details.
          </p>
        )}
        <Link to="/terms" className="mt-2 inline-block text-base font-semibold underline text-gray-900">
          Learn more
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="rounded-xl bg-pink-50 border border-pink-100 px-4 py-5">
          <h3 className="font-heading text-lg mb-2">Managed by</h3>
          <p className="text-xl font-heading leading-tight">{settings.resortName}</p>
          <p className="text-base text-gray-700 mt-2">Curated villas across Lonavala · Responds within an hour</p>
          <Link to="/contact" className="mt-3 inline-block text-base font-semibold text-airbnb-red underline hover:text-airbnb-red-dark">
            Contact us
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <PublicLayout currentPage="villas">
      <div className="villa-detail-page max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[2rem] leading-tight">
            {pageTitle}
          </h1>
          <button
            type="button"
            onClick={handleShare}
            className="hidden sm:inline-flex items-center gap-2 shrink-0 rounded-lg px-3 py-2 text-sm font-semibold underline hover:bg-gray-50"
          >
            <ArrowUpOnSquareIcon className="h-4 w-4" />
            Share
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10 xl:gap-16">
          <div className="flex-1 min-w-0">
            <VillaPhotoGallery images={galleryImages} originals={room.images} alt={room.name} />

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base text-gray-900 mt-6 mb-6">
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
                Up to {getVillaFinalCapacity(room)} guests
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

            <div className="space-y-10">
              <section className="pb-8 border-b border-gray-200">
                <h2 className="text-xl font-bold mb-3">About this space</h2>
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
                <h2 className="text-xl font-bold mb-5">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  {visibleAmenities.map((amenity) => (
                    <div key={amenity} className="text-base text-gray-800">
                      {amenity}
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
                  <h2 className="text-xl font-bold mb-4">Where you&apos;ll be</h2>
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
            </div>
          </div>

          <aside className="w-full lg:w-[400px] lg:shrink-0">
            <div className="hidden lg:block">{bookingCard}</div>
            <div className="lg:hidden mb-8">{bookingCard}</div>
            {policySidebar}
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
        total={pricing.total}
        canBook={canBook}
        onBook={navigateToBooking}
        onContact={() => navigate('/contact')}
      />
    </PublicLayout>
  );
};

export default RoomDetailPage;
