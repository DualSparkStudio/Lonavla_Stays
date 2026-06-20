-- =============================================================================
-- RESET old resort schema → prepare for lonavala-stays-setup.sql
--
-- Run this ONLY if you previously ran supabase-schema.sql or
-- migrations/20260604_brick_beam_calendar.sql (rooms / room_id model).
--
-- WARNING: Deletes bookings, blocked dates, rooms, and facilities data.
-- Then run: supabase/lonavala-stays-setup.sql (full file)
-- =============================================================================

DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.blocked_dates CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.room_types CASCADE;
DROP TABLE IF EXISTS public.resort_closures CASCADE;
DROP TABLE IF EXISTS public.calendar_settings CASCADE;
DROP TABLE IF EXISTS public.facilities CASCADE;
DROP TABLE IF EXISTS public.properties_for_sale CASCADE;
DROP TABLE IF EXISTS public.villas CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
