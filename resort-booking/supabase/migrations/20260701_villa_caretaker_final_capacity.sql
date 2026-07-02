-- Per-villa caretaker contact and maximum guest capacity
ALTER TABLE public.villas
  ADD COLUMN IF NOT EXISTS caretaker_phone TEXT,
  ADD COLUMN IF NOT EXISTS final_capacity INTEGER;

COMMENT ON COLUMN public.villas.caretaker_phone IS 'On-site caretaker phone shown on booking confirmation and guest emails';
COMMENT ON COLUMN public.villas.final_capacity IS 'Maximum guests allowed for bookings; caps guest selector on the website';
