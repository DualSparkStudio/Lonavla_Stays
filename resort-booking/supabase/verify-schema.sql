-- Run in Supabase SQL Editor AFTER install-fresh.sql
-- Compare output with "expected" below.

-- 1) Tables that should exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2) Must show villa_id (NOT room_id)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'blocked_dates'
ORDER BY ordinal_position;

-- 3) Must show image column on facilities
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'facilities'
ORDER BY ordinal_position;

-- 4) Row counts (after seed)
SELECT 'villas' AS tbl, COUNT(*)::int AS rows FROM public.villas
UNION ALL SELECT 'properties_for_sale', COUNT(*)::int FROM public.properties_for_sale
UNION ALL SELECT 'site_settings', COUNT(*)::int FROM public.site_settings
UNION ALL SELECT 'facilities', COUNT(*)::int FROM public.facilities;

-- EXPECTED:
-- Tables include: villas, properties_for_sale, site_settings, facilities, bookings, blocked_dates
-- blocked_dates has column: villa_id
-- facilities has column: image
-- Row counts: villas=4, properties_for_sale=6, site_settings=1, facilities=6
--
-- Project URL in dashboard must match VITE_SUPABASE_URL (ref in URL, e.g. mvycbownmrrygjxcsnbm)
