import React, { memo, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { addDays, format, parseISO } from 'date-fns';
import '../styles/fullcalendar.css';
import type { AdminBooking, BlockedDate, Room } from '../types/site';
import { bookingEventEnd } from '../lib/availability';

type EnhancedCalendarProps = {
  bookings: AdminBooking[];
  rooms: Room[];
  blockedDates: BlockedDate[];
  selectedRoom: string | 'all';
  onDateSelect: (selectInfo: DateSelectArg) => void;
  onBookingClick: (booking: AdminBooking) => void;
  onBlockedClick: (blocked: BlockedDate) => void;
};

const FC_PLUGINS = [dayGridPlugin, interactionPlugin];
const FC_HEADER = {
  left: 'prev,next today',
  center: 'title',
  right: 'dayGridMonth,dayGridWeek',
} as const;

const statusColors: Record<AdminBooking['status'], { bg: string; border: string }> = {
  confirmed: { bg: '#ef4444', border: '#dc2626' },
  pending: { bg: '#f59e0b', border: '#d97706' },
  cancelled: { bg: '#6b7280', border: '#4b5563' },
  completed: { bg: '#6b7280', border: '#4b5563' },
};

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  bookings,
  rooms,
  blockedDates,
  selectedRoom,
  onDateSelect,
  onBookingClick,
  onBlockedClick,
}) => {
  const roomNameById = useMemo(
    () => Object.fromEntries(rooms.map((r) => [r.id, r.name])),
    [rooms],
  );

  const filteredBookings = useMemo(
    () =>
      selectedRoom === 'all' ? bookings : bookings.filter((b) => b.roomId === selectedRoom),
    [bookings, selectedRoom],
  );

  const filteredBlocks = useMemo(
    () =>
      selectedRoom === 'all'
        ? blockedDates.filter((b) => b.source === 'manual')
        : blockedDates.filter((b) => b.source === 'manual' && b.roomId === selectedRoom),
    [blockedDates, selectedRoom],
  );

  const events: EventInput[] = useMemo(() => {
    const bookingEvents: EventInput[] = filteredBookings.map((b) => {
      const colors = statusColors[b.status];
      const villa = roomNameById[b.roomId] ?? b.roomName;
      return {
        id: `booking-${b.id}`,
        title: `${b.guestName} · ${villa}`,
        start: b.checkIn,
        end: bookingEventEnd(b.checkOut),
        allDay: true,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: '#fff',
        extendedProps: { type: 'booking', booking: b },
      };
    });

    const blockEvents: EventInput[] = filteredBlocks.map((b) => {
      const villa = roomNameById[b.roomId] ?? 'Villa';
      return {
        id: `block-${b.id}`,
        title: `Blocked · ${villa}`,
        start: b.startDate,
        end: format(addDays(parseISO(b.endDate), 1), 'yyyy-MM-dd'),
        allDay: true,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        textColor: '#fff',
        extendedProps: { type: 'blocked', blockedDate: b },
      };
    });

    return [...bookingEvents, ...blockEvents];
  }, [filteredBookings, filteredBlocks, roomNameById]);

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const type = info.event.extendedProps.type as string;
      if (type === 'booking') {
        onBookingClick(info.event.extendedProps.booking as AdminBooking);
      } else if (type === 'blocked') {
        onBlockedClick(info.event.extendedProps.blockedDate as BlockedDate);
      }
    },
    [onBookingClick, onBlockedClick],
  );

  return (
    <div className="enhanced-calendar rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <FullCalendar
        plugins={FC_PLUGINS}
        initialView="dayGridMonth"
        height="auto"
        selectable
        selectMirror
        fixedWeekCount={false}
        headerToolbar={FC_HEADER}
        events={events}
        select={onDateSelect}
        eventClick={handleEventClick}
      />
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-red-500" /> Confirmed
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-500" /> Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-blue-500" /> Blocked
        </span>
      </div>
    </div>
  );
};

export default memo(EnhancedCalendar);
