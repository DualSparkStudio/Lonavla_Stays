import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminCardActions from '../../components/admin/AdminCardActions';
import AdminFormField, { adminInputClass } from '../../components/admin/AdminFormField';
import BookingDetailsModal from '../../components/BookingDetailsModal';
import { notifyBookingByEmail } from '../../lib/bookingEmail';
import { useSiteData } from '../../context/SiteDataContext';
import type { AdminBooking } from '../../types/site';

const emptyBooking = (): Omit<AdminBooking, 'id' | 'bookedAt'> => ({
  bookingRef: `RB${Date.now().toString().slice(-6)}`,
  roomId: '',
  roomName: '',
  guestName: '',
  guestEmail: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
  total: 0,
  status: 'pending',
});

const statusBadgeClass = (status: AdminBooking['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-red-100 text-red-800';
  }
};

const AdminBookingsPage: React.FC = () => {
  const { bookings, rooms, addBooking, deleteBooking, settings } = useSiteData();
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyBooking());
  const [saved, setSaved] = useState(false);
  const [viewing, setViewing] = useState<AdminBooking | null>(null);

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find((r) => r.id === draft.roomId);
    const bookingRef = draft.bookingRef;
    const checkIn = draft.checkIn;
    const checkOut = draft.checkOut;
    const guests = Number(draft.guests);
    const total = Number(draft.total);
    const roomName = room?.name ?? draft.roomName;

    addBooking({
      ...draft,
      roomName,
      total,
      guests,
    });

    const nights = checkIn && checkOut ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0;

    notifyBookingByEmail({
      bookingRef,
      guestName: draft.guestName,
      guestEmail: draft.guestEmail,
      roomId: draft.roomId,
      roomName,
      checkIn,
      checkOut,
      guests,
      nights,
      basePrice: total,
      extraGuestsCharge: 0,
      total,
      guestPhone: '',
      paymentCompleted: false,
      resortName: settings.resortName,
      resortPhone: settings.resortPhone,
      resortEmail: settings.resortEmail,
      resortAddress: settings.resortAddress,
      resortLocation: settings.resortLocation,
      checkInTime: settings.checkInTime,
      checkOutTime: settings.checkOutTime,
    });

    setDraft(emptyBooking());
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout currentPage="bookings">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
          <p className="text-gray-900">Manage reservations from the booking flow or add them manually.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          {showForm ? 'Cancel' : 'Add booking'}
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Booking saved successfully.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminFormField label="Villa" className="md:col-span-2">
            <select
              required
              value={draft.roomId}
              onChange={(e) => {
                const room = rooms.find((r) => r.id === e.target.value);
                setDraft({ ...draft, roomId: e.target.value, roomName: room?.name ?? '' });
              }}
              className={adminInputClass}
            >
              <option value="">Select villa</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Guest name">
            <input required value={draft.guestName} onChange={(e) => setDraft({ ...draft, guestName: e.target.value })} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Guest email">
            <input required type="email" value={draft.guestEmail} onChange={(e) => setDraft({ ...draft, guestEmail: e.target.value })} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Check-in date">
            <input required type="date" value={draft.checkIn} onChange={(e) => setDraft({ ...draft, checkIn: e.target.value })} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Check-out date">
            <input required type="date" value={draft.checkOut} onChange={(e) => setDraft({ ...draft, checkOut: e.target.value })} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Number of guests">
            <input required type="number" min={1} value={draft.guests} onChange={(e) => setDraft({ ...draft, guests: Number(e.target.value) })} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Total amount (INR)">
            <input required type="number" min={0} value={draft.total || ''} onChange={(e) => setDraft({ ...draft, total: Number(e.target.value) })} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Booking reference" className="md:col-span-2" hint="Unique ID shown to the guest">
            <input value={draft.bookingRef} onChange={(e) => setDraft({ ...draft, bookingRef: e.target.value })} className={adminInputClass} />
          </AdminFormField>
          <button type="submit" className="md:col-span-2 bg-red-500 text-white py-2 rounded-lg font-bold">Save booking</button>
        </form>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm sm:text-base font-bold capitalize ${
              filter === s ? 'bg-red-500 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-900 bg-white rounded-xl p-8 text-center border">No bookings match this filter.</p>
      ) : (
        <>
          <div className="lg:hidden space-y-4">
            {filtered.map((b) => (
              <article key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{b.guestName}</p>
                    <p className="text-sm text-gray-600 truncate">{b.guestEmail}</p>
                    <p className="text-xs font-mono text-gray-500 mt-1">{b.bookingRef}</p>
                  </div>
                  <span className={`shrink-0 capitalize px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(b.status)}`}>
                    {b.status}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm mb-4">
                  <div>
                    <dt className="text-gray-500 text-xs font-semibold uppercase">Villa</dt>
                    <dd className="font-medium text-gray-900">{b.roomName}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 text-xs font-semibold uppercase">Total</dt>
                    <dd className="font-medium text-gray-900">₹{b.total.toLocaleString('en-IN')}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500 text-xs font-semibold uppercase">Dates</dt>
                    <dd className="font-medium text-gray-900">{b.checkIn} → {b.checkOut}</dd>
                  </div>
                </dl>
                <AdminCardActions
                  onView={() => setViewing(b)}
                  onDelete={() => window.confirm('Delete this booking?') && deleteBooking(b.id)}
                />
              </article>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Ref', 'Guest', 'Villa', 'Dates', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-base font-medium">{b.bookingRef}</td>
                  <td className="px-4 py-3 text-base">{b.guestName}<br /><span className="text-gray-900">{b.guestEmail}</span></td>
                  <td className="px-4 py-3 text-base">{b.roomName}</td>
                  <td className="px-4 py-3 text-base">{b.checkIn} → {b.checkOut}</td>
                  <td className="px-4 py-3 text-base">₹{b.total.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex capitalize px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadgeClass(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminCardActions
                      onView={() => setViewing(b)}
                      onDelete={() => window.confirm('Delete this booking?') && deleteBooking(b.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      <BookingDetailsModal
        booking={viewing}
        roomName={viewing ? rooms.find((r) => r.id === viewing.roomId)?.name : undefined}
        onClose={() => setViewing(null)}
      />
    </AdminLayout>
  );
};

export default AdminBookingsPage;
