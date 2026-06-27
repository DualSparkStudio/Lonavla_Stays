-- Guest-openable Google Maps link (Share → Copy link). Not embed/iframe URLs.
-- Used in booking emails and "Open in Google Maps" links.

ALTER TABLE public.villas
  ADD COLUMN IF NOT EXISTS maps_link TEXT;

ALTER TABLE public.properties_for_sale
  ADD COLUMN IF NOT EXISTS maps_link TEXT;

COMMENT ON COLUMN public.villas.maps_link IS
  'Google Maps share or place URL for guests (email, directions). Paste from Share → Copy link — not Embed a map.';

COMMENT ON COLUMN public.properties_for_sale.maps_link IS
  'Google Maps share or place URL for guests. Paste from Share → Copy link — not Embed a map.';
