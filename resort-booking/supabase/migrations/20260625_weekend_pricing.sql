-- Add optional weekend nightly rate for villas.
-- Weekend rate is used for Saturday/Sunday nights in booking calculations.

ALTER TABLE public.villas
  ADD COLUMN IF NOT EXISTS weekend_price_per_night NUMERIC(10, 2);

COMMENT ON COLUMN public.villas.weekend_price_per_night IS
  'Optional weekend nightly price (Saturday nights and site pricing holidays). When null, price_per_night is used for all nights.';
