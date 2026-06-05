import React, { useCallback, useState } from 'react';
import type { DateSelectArg } from '@fullcalendar/core';
import { addDays, format, parseISO } from 'date-fns';
import { notify } from '../../lib/notify';
import AdminLayout from '../../components/admin/AdminLayout';
import EnhancedCalendar from '../../components/EnhancedCalendar';
import BookingDetailsModal from '../../components/BookingDetailsModal';
import BlockedDateDetailsModal from '../../components/BlockedDateDetailsModal';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useSiteData } from '../../context/SiteDataContext';
import type { AdminBooking, BlockedDate } from '../../types/site';
import { findMatchingManualBlock } from '../../lib/availability';

const AdminCalendarPage: React.FC = () => {
  const { rooms, bookings, blockedDates, blockDates, deleteBlockedDate, getRoomById } = useSiteData();
  const [selectedRoom, setSelectedRoom] = useState<string | 'all'>('all');
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockedDate | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [unblockModalOpen, setUnblockModalOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<{
    roomId: string;
    startDate: string;
    endDate: string;
  } | null>(null);
  const [reason, setReason] = useState('Maintenance');
  const [notes, setNotes] = useState('');

  const resolveRoomId = (): string => {
    if (selectedRoom !== 'all') return selectedRoom;
    if (rooms.length === 1) return rooms[0].id;
    return '';
  };

  const handleBlockedClick = useCallback((b: BlockedDate) => {
    setSelectedBlock(b);
    setUnblockModalOpen(true);
  }, []);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    const roomId = resolveRoomId();
    if (!roomId) {
      notify.error('Select a villa from the filter before blocking dates.');
      selectInfo.view.calendar.unselect();
      return;
    }

    let startDate = selectInfo.startStr.slice(0, 10);
    let endDate = selectInfo.endStr.slice(0, 10);
    if (selectInfo.allDay && endDate > startDate) {
      endDate = format(addDays(parseISO(endDate), -1), 'yyyy-MM-dd');
    }
    if (startDate === endDate) {
      endDate = startDate;
    }

    const existing = findMatchingManualBlock(roomId, startDate, endDate, blockedDates);
    setPendingRange({ roomId, startDate, endDate });
    if (existing) {
      setSelectedBlock(existing);
      setUnblockModalOpen(true);
    } else {
      setReason('Maintenance');
      setNotes('');
      setBlockModalOpen(true);
    }
    selectInfo.view.calendar.unselect();
  }, [blockedDates, rooms, selectedRoom]);

  const handleSaveBlock = () => {
    if (!pendingRange || !reason.trim()) {
      notify.error('Reason is required.');
      return;
    }
    blockDates({
      roomId: pendingRange.roomId,
      startDate: pendingRange.startDate,
      endDate: pendingRange.endDate,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
    });
    notify.success('Dates blocked.');
    setBlockModalOpen(false);
    setPendingRange(null);
  };

  const handleUnblock = (id: string) => {
    deleteBlockedDate(id);
    notify.success('Dates unblocked.');
    setUnblockModalOpen(false);
    setSelectedBlock(null);
    setPendingRange(null);
  };

  const pendingRoom = pendingRange ? getRoomById(pendingRange.roomId) : undefined;

  return (
    <AdminLayout currentPage="calendar">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability calendar</h1>
          <p className="text-gray-600 text-sm mt-1">
            View bookings and block dates. Drag on the calendar to block or unblock a range.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          Villa
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value as string | 'all')}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
          >
            <option value="all">All villas</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <EnhancedCalendar
        bookings={bookings}
        rooms={rooms}
        blockedDates={blockedDates}
        selectedRoom={selectedRoom}
        onDateSelect={handleDateSelect}
        onBookingClick={setSelectedBooking}
        onBlockedClick={handleBlockedClick}
      />

      <BookingDetailsModal
        booking={selectedBooking}
        roomName={selectedBooking ? getRoomById(selectedBooking.roomId)?.name : undefined}
        onClose={() => setSelectedBooking(null)}
      />

      <BlockedDateDetailsModal
        blocked={unblockModalOpen ? selectedBlock : null}
        roomName={selectedBlock ? getRoomById(selectedBlock.roomId)?.name : undefined}
        onClose={() => {
          setUnblockModalOpen(false);
          setSelectedBlock(null);
        }}
        onUnblock={handleUnblock}
      />

      <Modal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setPendingRange(null);
        }}
        title="Block dates"
        size="md"
      >
        {pendingRange && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {pendingRoom?.name ?? 'Villa'} · {pendingRange.startDate} – {pendingRange.endDate}
            </p>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Reason</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 resize-none"
              />
            </div>
            <Button fullWidth onClick={handleSaveBlock}>
              Block dates
            </Button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminCalendarPage;
