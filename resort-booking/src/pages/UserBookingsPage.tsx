import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import { cn } from '../utils/cn';
import { demoRooms, formatPrice } from '../data/resort';

interface BookingData {
  id: string;
  roomName: string;
  roomImage: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  status: 'upcoming' | 'completed' | 'cancelled';
  totalAmount: number;
  bookingDate: string;
  confirmationCode: string;
  location: string;
  rating?: number;
  hasReview?: boolean;
}

const UserBookingsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock booking data
  const bookings: BookingData[] = [
    {
      id: 'RST001234',
      roomName: 'Hillside Premium Villa',
      roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&h=200&fit=crop',
      checkIn: '2026-06-12',
      checkOut: '2026-06-15',
      guests: { adults: 2, children: 0, infants: 0 },
      status: 'upcoming',
      totalAmount: 34500,
      bookingDate: '2026-05-01',
      confirmationCode: 'LON123DEF',
      location: demoRooms[2].location,
    },
    {
      id: 'RST001235',
      roomName: 'Garden Wing Villa',
      roomImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=300&h=200&fit=crop',
      checkIn: '2025-12-20',
      checkOut: '2025-12-23',
      guests: { adults: 2, children: 1, infants: 0 },
      status: 'completed',
      totalAmount: 27600,
      bookingDate: '2025-11-15',
      confirmationCode: 'LON789GHI',
      location: demoRooms[1].location,
      rating: 5,
      hasReview: true,
    },
    {
      id: 'RST001236',
      roomName: 'Valley View Villa',
      roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=300&h=200&fit=crop',
      checkIn: '2025-11-10',
      checkOut: '2025-11-12',
      guests: { adults: 1, children: 0, infants: 0 },
      status: 'completed',
      totalAmount: 13000,
      bookingDate: '2025-10-20',
      confirmationCode: 'LON456JKL',
      location: demoRooms[0].location,
    },
    {
      id: 'RST001237',
      roomName: 'Garden Cottage Villa',
      roomImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=300&h=200&fit=crop',
      checkIn: '2025-09-15',
      checkOut: '2025-09-18',
      guests: { adults: 2, children: 0, infants: 0 },
      status: 'cancelled',
      totalAmount: 23400,
      bookingDate: '2025-08-10',
      confirmationCode: 'LON789MNO',
      location: demoRooms[3].location,
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    if (selectedTab === 'all') return true;
    return booking.status === selectedTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <ClockIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const handleCancelBooking = (booking: BookingData) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const confirmCancellation = () => {
    // Handle cancellation logic here
    console.log('Cancelling booking:', selectedBooking?.id);
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const getTotalGuests = (guests: BookingData['guests']) => {
    const total = guests.adults + guests.children;
    let text = `${total} guest${total !== 1 ? 's' : ''}`;
    if (guests.infants > 0) {
      text += `, ${guests.infants} infant${guests.infants !== 1 ? 's' : ''}`;
    }
    return text;
  };

  const canCancelBooking = (booking: BookingData) => {
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const hoursDiff = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24 && booking.status === 'upcoming';
  };

  return (
    <PublicLayout currentPage="bookings">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatedSection className="mb-8">
          <h1 className="font-heading text-4xl text-gray-900 mb-2">My bookings</h1>
          <p className="text-2xl text-gray-900">
            Your villa bookings across our Lonavala collection
          </p>
        </AnimatedSection>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav className="-mb-px flex gap-6 overflow-x-auto scrollbar-hide pb-px">
            {[
              { key: 'all', label: 'All Bookings', count: bookings.length },
              { key: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.status === 'upcoming').length },
              { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
              { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-base whitespace-nowrap',
                  selectedTab === tab.key
                    ? 'border-airbnb-red text-airbnb-red'
                    : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-base font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-base text-gray-900">
              {selectedTab === 'all' ? "You haven't made any bookings yet." : `No ${selectedTab} bookings found.`}
            </p>
            <div className="mt-6">
              <Link to="/villas">
                <Button>
                  Browse Villas
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Room Image */}
                    <div className="shrink-0">
                      <img
                        src={booking.roomImage}
                        alt={booking.roomName}
                        className="h-40 w-full sm:h-24 sm:w-32 rounded-lg object-cover"
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {booking.roomName}
                          </h3>
                          <div className="flex items-center text-base text-gray-900 mb-2">
                            <MapPinIcon className="h-4 w-4 mr-1 shrink-0" />
                            {booking.location}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-base text-gray-900">
                            <div className="flex items-center">
                              <CalendarDaysIcon className="h-4 w-4 mr-1 shrink-0" />
                              {new Date(booking.checkIn).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })} - {new Date(booking.checkOut).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1 shrink-0" />
                              {getTotalGuests(booking.guests)}
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <div className="flex items-center justify-end mb-2">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              getStatusColor(booking.status)
                            )}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status}</span>
                            </span>
                          </div>
                          <div className="text-xl font-semibold text-gray-900">
                            {formatPrice(booking.totalAmount)}
                          </div>
                          <div className="text-base text-gray-900">
                            Booking #{booking.id}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        {booking.status === 'completed' && !booking.hasReview && (
                          <Button variant="outline" size="sm">
                            Write Review
                          </Button>
                        )}

                        {booking.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Download Receipt
                          </Button>
                        )}

                        {canCancelBooking(booking) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelBooking(booking)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Cancel Booking
                          </Button>
                        )}

                        {booking.status === 'upcoming' && (
                          <Button variant="outline" size="sm">
                            Modify Booking
                          </Button>
                        )}
                      </div>

                      {/* Review Display */}
                      {booking.status === 'completed' && booking.hasReview && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <span className="text-base font-medium text-gray-900 mr-2">Your Review:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <StarSolidIcon
                                  key={i}
                                  className={cn(
                                    'h-4 w-4',
                                    i < (booking.rating || 0) ? 'text-airbnb-red' : 'text-gray-300'
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-base text-gray-900">
                            "Amazing stay! The ocean view was breathtaking and the amenities were top-notch."
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Booking Details"
          size="lg"
        >
          {selectedBooking && (
            <div className="space-y-6">
              <div className="flex space-x-4">
                <img
                  src={selectedBooking.roomImage}
                  alt={selectedBooking.roomName}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedBooking.roomName}</h3>
                  <p className="text-gray-900">{selectedBooking.location}</p>
                  <div className="mt-2">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusColor(selectedBooking.status)
                    )}>
                      {getStatusIcon(selectedBooking.status)}
                      <span className="ml-1 capitalize">{selectedBooking.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium text-gray-700">Check-in</label>
                  <p className="mt-1 text-base text-gray-900">
                    {new Date(selectedBooking.checkIn).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700">Check-out</label>
                  <p className="mt-1 text-base text-gray-900">
                    {new Date(selectedBooking.checkOut).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700">Guests</label>
                <p className="mt-1 text-base text-gray-900">{getTotalGuests(selectedBooking.guests)}</p>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700">Confirmation Code</label>
                <p className="mt-1 text-base font-mono font-semibold text-gray-900">{selectedBooking.confirmationCode}</p>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700">Total Amount</label>
                <p className="mt-1 text-xl font-semibold text-gray-900">{formatPrice(selectedBooking.totalAmount)}</p>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700">Booking Date</label>
                <p className="mt-1 text-base text-gray-900">
                  {new Date(selectedBooking.bookingDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
        </Modal>

        {/* Cancel Booking Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Booking"
        >
          {selectedBooking && (
            <div className="space-y-4">
              <p className="text-gray-900">
                Are you sure you want to cancel your booking for <strong>{selectedBooking.roomName}</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Cancellation Policy</h4>
                <p className="text-base text-yellow-700">
                  Free cancellation until 24 hours before check-in. After that, you'll receive a 50% refund.
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Booking
                </Button>
                <Button
                  fullWidth
                  onClick={confirmCancellation}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PublicLayout>
  );
};

export default UserBookingsPage; 