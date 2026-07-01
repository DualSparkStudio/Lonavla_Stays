import React, { memo, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { addDays, differenceInCalendarDays, format, parseISO, startOfToday } from 'date-fns';
import '../styles/fullcalendar.css';
import { notify } from '../lib/notify';
import { useSiteBookings } from '../context/SiteDataContext';
import {
  bookingEventEnd,
  checkRoomAvailability,
  isUnavailableForCheckIn,
} from '../lib/availability';

type AvailabilityCalendarProps = {
  roomId: string;
  onDateSelect: (checkIn: string, checkOut: string) => void;
  selectedStartDate?: string;
  selectedEndDate?: string;
  embedded?: boolean;
};

const FC_PLUGINS = [dayGridPlugin, interactionPlugin];
const FC_HEADER = { left: 'prev', center: 'title', right: 'next today' } as const;
const TODAY = format(startOfToday(), 'yyyy-MM-dd');

function hasCompleteStay(checkIn?: string, checkOut?: string): boolean {
  return Boolean(checkIn && checkOut && checkOut > checkIn);
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  roomId,
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
  embedded = false,
}) => {
  const { bookings, blockedDates } = useSiteBookings();

  const roomBookings = useMemo(
    () => bookings.filter((b) => b.roomId === roomId && b.status !== 'cancelled'),
    [bookings, roomId],
  );

  const roomBlocks = useMemo(
    () => blockedDates.filter((b) => b.roomId === roomId && b.source === 'manual'),
    [blockedDates, roomId],
  );

  const complete = hasCompleteStay(selectedStartDate, selectedEndDate);
  const awaitingCheckOut = Boolean(selectedStartDate && !complete);

  const nights = useMemo(() => {
    if (!complete || !selectedStartDate || !selectedEndDate) return 0;
    return differenceInCalendarDays(parseISO(selectedEndDate), parseISO(selectedStartDate));
  }, [complete, selectedStartDate, selectedEndDate]);

  const events: EventInput[] = useMemo(() => {
    const bookingEvents: EventInput[] = roomBookings.map((b) => ({
      id: `booking-${b.id}`,
      title: 'Booked',
      start: b.checkIn,
      end: bookingEventEnd(b.checkOut),
      allDay: true,
      display: 'background',
      backgroundColor: '#fecaca',
      borderColor: '#f87171',
      extendedProps: { type: 'booking' },
    }));

    const blockEvents: EventInput[] = roomBlocks.map((b) => ({
      id: `block-${b.id}`,
      title: 'Blocked',
      start: b.startDate,
      end: format(addDays(parseISO(b.endDate), 1), 'yyyy-MM-dd'),
      allDay: true,
      display: 'background',
      backgroundColor: '#e5e7eb',
      borderColor: '#9ca3af',
      extendedProps: { type: 'blocked' },
    }));

    const selectionEvents: EventInput[] = [];
    if (selectedStartDate) {
      const endExclusive = complete
        ? bookingEventEnd(selectedEndDate!)
        : bookingEventEnd(selectedStartDate);
      selectionEvents.push({
        id: 'selection',
        title: complete ? 'Your stay' : 'Check-in',
        start: selectedStartDate,
        end: endExclusive,
        allDay: true,
        backgroundColor: complete ? '#10b981' : '#6ee7b7',
        borderColor: '#059669',
        textColor: '#fff',
      });
    }

    return [...bookingEvents, ...blockEvents, ...selectionEvents];
  }, [roomBookings, roomBlocks, selectedStartDate, selectedEndDate, complete]);

  const applyRange = useCallback(
    (checkIn: string, checkOut: string) => {
      if (checkOut && checkOut <= checkIn) {
        notify.error('Check-out must be after check-in.');
        return false;
      }
      if (checkOut) {
        const result = checkRoomAvailability(roomId, checkIn, checkOut, bookings, blockedDates);
        if (!result.available) {
          notify.error(result.reason ?? 'Those dates are not available.');
          return false;
        }
        onDateSelect(checkIn, checkOut);
        const n = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
        notify.success(`${n} night${n !== 1 ? 's' : ''} selected`);
        return true;
      }
      onDateSelect(checkIn, '');
      notify.info('Now tap your check-out date');
      return true;
    },
    [roomId, bookings, blockedDates, onDateSelect],
  );

  const handleDateClick = useCallback(
    (dateStr: string) => {
      if (dateStr < TODAY) return;
      // Check-out may fall on the first day of a booking/block (turnover day).
      if (
        !awaitingCheckOut &&
        isUnavailableForCheckIn(dateStr, roomBookings, roomBlocks, roomId)
      ) {
        notify.error('This date is not available.');
        return;
      }

      if (complete) {
        applyRange(dateStr, '');
        return;
      }

      if (awaitingCheckOut && selectedStartDate) {
        if (dateStr === selectedStartDate) {
          notify.error('Check-out must be after check-in.');
          return;
        }
        if (dateStr < selectedStartDate) {
          applyRange(dateStr, '');
          return;
        }
        applyRange(selectedStartDate, dateStr);
        return;
      }

      applyRange(dateStr, '');
    },
    [roomBookings, roomBlocks, roomId, complete, awaitingCheckOut, selectedStartDate, applyRange],
  );

  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      const start = selectInfo.startStr.slice(0, 10);
      let end = selectInfo.endStr.slice(0, 10);
      if (selectInfo.allDay && end > start) {
        end = format(addDays(parseISO(end), -1), 'yyyy-MM-dd');
      }

      selectInfo.view.calendar.unselect();

      if (start < TODAY) {
        notify.error('Cannot select past dates.');
        return;
      }

      if (start === end) {
        handleDateClick(start);
        return;
      }

      if (isUnavailableForCheckIn(start, roomBookings, roomBlocks, roomId)) {
        notify.error('Check-in falls on an unavailable date.');
        return;
      }

      const result = checkRoomAvailability(roomId, start, end, bookings, blockedDates);
      if (!result.available) {
        notify.error(result.reason ?? 'Range includes unavailable dates.');
        return;
      }

      applyRange(start, end);
    },
    [handleDateClick, roomBookings, roomBlocks, roomId, applyRange, bookings, blockedDates],
  );

  const selectAllow = useCallback(
    (selectInfo: { start: Date; end: Date }) => {
      const start = format(selectInfo.start, 'yyyy-MM-dd');
      const end = format(addDays(selectInfo.end, -1), 'yyyy-MM-dd');
      if (start < TODAY) return false;
      if (isUnavailableForCheckIn(start, roomBookings, roomBlocks, roomId)) return false;
      if (end <= start) return true;
      return checkRoomAvailability(roomId, start, end, bookings, blockedDates).available;
    },
    [roomBookings, roomBlocks, roomId, bookings, blockedDates],
  );

  const dayCellClassNames = useCallback(
    (arg: { date: Date }) => {
      const d = format(arg.date, 'yyyy-MM-dd');
      const classes: string[] = [];
      if (d < TODAY) classes.push('fc-day-past-custom');
      if (selectedStartDate && d === selectedStartDate) classes.push('fc-day-check-in');
      if (complete && selectedEndDate && d === selectedEndDate) classes.push('fc-day-check-out');
      if (
        complete &&
        selectedStartDate &&
        selectedEndDate &&
        d > selectedStartDate &&
        d < selectedEndDate
      ) {
        classes.push('fc-day-in-range');
      }
      return classes;
    },
    [selectedStartDate, selectedEndDate, complete],
  );

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      info.jsEvent.preventDefault();
      const type = info.event.extendedProps.type as string | undefined;
      if (type === 'booking' || type === 'blocked') {
        const dateStr = format(info.event.start!, 'yyyy-MM-dd');
        if (awaitingCheckOut) {
          handleDateClick(dateStr);
          return;
        }
        notify.info('This date is unavailable for check-in.');
      }
    },
    [awaitingCheckOut, handleDateClick],
  );

  const wrapperClass = embedded
    ? 'availability-calendar availability-calendar--embedded'
    : 'availability-calendar rounded-xl border border-gray-200 bg-white p-3 shadow-sm';

  return (
    <div className={wrapperClass}>
      <p className="mb-2 text-sm text-gray-900 leading-snug">
        {awaitingCheckOut
          ? 'Tap your check-out date — booked or blocked days can be used as check-out (turnover day).'
          : 'Tap check-in, then check-out (or drag a range).'}{' '}
        <span className="text-gray-900">Gray = blocked · Pink = booked</span>
      </p>

      {(selectedStartDate || complete) && (
        <div className="mb-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-green-50 border border-green-200 px-2 py-1 font-semibold text-green-800">
            Check-in: {selectedStartDate ? format(parseISO(selectedStartDate), 'MMM d, yyyy') : '—'}
          </span>
          <span
            className={`rounded-md border px-2 py-1 font-semibold ${
              complete
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            Check-out:{' '}
            {complete && selectedEndDate
              ? format(parseISO(selectedEndDate), 'MMM d, yyyy')
              : 'Select date'}
          </span>
          {complete && nights > 0 && (
            <span className="rounded-md bg-gray-100 border border-gray-200 px-2 py-1 font-semibold text-gray-700">
              {nights} night{nights !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      <FullCalendar
        plugins={FC_PLUGINS}
        initialView="dayGridMonth"
        height="auto"
        selectable
        selectMirror
        unselectAuto={false}
        fixedWeekCount={false}
        longPressDelay={200}
        selectMinDistance={2}
        headerToolbar={FC_HEADER}
        titleFormat={{ year: 'numeric', month: 'long' }}
        buttonText={{ today: 'Today' }}
        events={events}
        dateClick={(arg) => handleDateClick(arg.dateStr)}
        select={handleDateSelect}
        selectAllow={selectAllow}
        dayCellClassNames={dayCellClassNames}
        eventClick={handleEventClick}
        validRange={{ start: TODAY }}
      />
    </div>
  );
};

export default memo(AvailabilityCalendar);
